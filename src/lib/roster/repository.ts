import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import {
  IsoDateSchema,
  RosterConflictSchema,
  RosterEntrySchema,
  type RosterConflict,
  type RosterEntry,
} from "@/lib/validation/roster";
import {
  createBaselineRosterInput,
  type BaselineRosterFixture,
} from "@/lib/roster/baseline-fixture";
import { getServerSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const PersistRosterMonthPayloadSchema = z.object({
  rosterMonthId: z.string().min(1),
  entries: z.array(RosterEntrySchema),
  conflicts: z.array(RosterConflictSchema),
});

export type PersistRosterMonthPayload = z.infer<
  typeof PersistRosterMonthPayloadSchema
>;

export const PersistManualEditPayloadSchema = z.object({
  rosterMonthId: z.string().min(1),
  workDate: IsoDateSchema,
  employeeId: z.string().min(1),
  brandId: z.string().min(1),
  podId: z.string().min(1),
  processId: z.string().min(1),
});

export type PersistManualEditPayload = z.infer<
  typeof PersistManualEditPayloadSchema
>;

export const ResolveConflictPayloadSchema = z.object({
  rosterMonthId: z.string().min(1),
  workDate: IsoDateSchema,
  conflictType: z.string().min(1),
  employeeId: z.string().nullable().optional(),
  brandId: z.string().nullable().optional(),
  resolutionNote: z.string().min(1, "Resolution note cannot be empty"),
});

export type ResolveConflictPayload = z.infer<
  typeof ResolveConflictPayloadSchema
>;

export interface LoadedRosterResult {
  source: "SUPABASE" | "BASELINE_FIXTURE";
  data: BaselineRosterFixture;
  existingEntries?: RosterEntry[];
  message: string;
}

export async function replaceGeneratedRosterEntries(
  db: SupabaseClient,
  rawPayload: PersistRosterMonthPayload
): Promise<{ insertedCount: number; conflictCount: number }> {
  const payload = PersistRosterMonthPayloadSchema.parse(rawPayload);

  const { error: deleteEntriesError } = await db
    .from("roster_entries")
    .delete()
    .eq("roster_month_id", payload.rosterMonthId)
    .eq("source", "GENERATED");

  if (deleteEntriesError) {
    throw new Error(
      `Failed to clear prior generated roster entries: ${deleteEntriesError.message}`
    );
  }

  if (payload.entries.length > 0) {
    const dbRows = payload.entries.map((entry: RosterEntry) => ({
      roster_month_id: payload.rosterMonthId,
      work_date: IsoDateSchema.parse(entry.workDate),
      employee_id: entry.employeeId,
      brand_id: entry.brandId,
      pod_id: entry.podId,
      process_id: entry.processId,
      source: entry.source,
    }));

    const { error: insertEntriesError } = await db
      .from("roster_entries")
      .insert(dbRows);

    if (insertEntriesError) {
      throw new Error(
        `Failed to insert roster entries: ${insertEntriesError.message}`
      );
    }
  }

  const { error: clearConflictsError } = await db
    .from("roster_conflicts")
    .delete()
    .eq("roster_month_id", payload.rosterMonthId)
    .is("resolved_at", null);

  if (clearConflictsError) {
    throw new Error(
      `Failed to refresh unresolved conflicts: ${clearConflictsError.message}`
    );
  }

  if (payload.conflicts.length > 0) {
    const conflictRows = payload.conflicts.map((conflict: RosterConflict) => ({
      roster_month_id: payload.rosterMonthId,
      work_date: IsoDateSchema.parse(conflict.workDate),
      employee_id: conflict.employeeId,
      brand_id: conflict.brandId,
      conflict_type: conflict.conflictType,
      severity: conflict.severity,
      description: conflict.description,
    }));

    const { error: insertConflictsError } = await db
      .from("roster_conflicts")
      .insert(conflictRows);

    if (insertConflictsError) {
      throw new Error(
        `Failed to persist roster conflicts: ${insertConflictsError.message}`
      );
    }
  }

  return {
    insertedCount: payload.entries.length,
    conflictCount: payload.conflicts.length,
  };
}

export async function upsertManualRosterEntry(
  db: SupabaseClient,
  rawPayload: PersistManualEditPayload
): Promise<{ success: boolean; entry: RosterEntry }> {
  const payload = PersistManualEditPayloadSchema.parse(rawPayload);

  const row = {
    roster_month_id: payload.rosterMonthId,
    work_date: payload.workDate,
    employee_id: payload.employeeId,
    brand_id: payload.brandId,
    pod_id: payload.podId,
    process_id: payload.processId,
    source: "MANUAL_EDIT" as const,
    updated_at: new Date().toISOString(),
  };

  const { error } = await db
    .from("roster_entries")
    .upsert(row, {
      onConflict: "roster_month_id,work_date,employee_id,brand_id",
    });

  if (error) {
    throw new Error(`Failed to persist manual edit: ${error.message}`);
  }

  return {
    success: true,
    entry: {
      workDate: payload.workDate,
      employeeId: payload.employeeId,
      brandId: payload.brandId,
      podId: payload.podId,
      processId: payload.processId,
      source: "MANUAL_EDIT",
    },
  };
}

export async function resolveRosterConflict(
  db: SupabaseClient,
  rawPayload: ResolveConflictPayload
): Promise<{ success: boolean; resolvedCount: number }> {
  const payload = ResolveConflictPayloadSchema.parse(rawPayload);

  let query = db
    .from("roster_conflicts")
    .update({
      resolved_at: new Date().toISOString(),
      resolution_note: payload.resolutionNote,
    })
    .eq("roster_month_id", payload.rosterMonthId)
    .eq("work_date", payload.workDate)
    .eq("conflict_type", payload.conflictType)
    .is("resolved_at", null);

  if (payload.employeeId) {
    query = query.eq("employee_id", payload.employeeId);
  }
  if (payload.brandId) {
    query = query.eq("brand_id", payload.brandId);
  }

  const { error } = await query;
  if (error) {
    throw new Error(`Failed to resolve conflict: ${error.message}`);
  }

  return {
    success: true,
    resolvedCount: 1,
  };
}

export async function loadRosterInputFromDb(
  db: SupabaseClient,
  year = 2026,
  month = 12
): Promise<LoadedRosterResult> {
  // Query core tables concurrently
  const [
    podsRes,
    procsRes,
    empsRes,
    brandsRes,
    assignsRes,
    calsRes,
    timeOffsRes,
    rulesRes,
  ] = await Promise.all([
    db.from("pods").select("id, code, name"),
    db.from("processes").select("id, code, name"),
    db
      .from("employees")
      .select("id, employee_code, full_name, pod_id, primary_process_id, is_active")
      .eq("is_active", true),
    db
      .from("brands")
      .select("id, code, name, staffing_mode, pod_id, process_id, is_active")
      .eq("is_active", true),
    db.from("brand_assignments").select("brand_id, employee_id, is_primary"),
    db.from("operating_calendars").select("id, name, operating_days, is_default"),
    db
      .from("employee_time_offs")
      .select("employee_id, time_off_date, kind, status, notes"),
    db
      .from("minimum_staffing_rules")
      .select("id, brand_id, pod_id, process_id, min_headcount, effective_from, effective_to"),
  ]);

  // Check for critical table load errors
  if (podsRes.error || procsRes.error || empsRes.error || brandsRes.error) {
    const errorDetails = [
      podsRes.error?.message,
      procsRes.error?.message,
      empsRes.error?.message,
      brandsRes.error?.message,
    ]
      .filter(Boolean)
      .join("; ");
    throw new Error(`Database query error while loading roster data: ${errorDetails}`);
  }

  const pods = podsRes.data ?? [];
  const processes = procsRes.data ?? [];
  const employeesRaw = empsRes.data ?? [];
  const brandsRaw = brandsRes.data ?? [];

  // If database tables are empty, fall back explicitly to deterministic baseline
  if (employeesRaw.length === 0 || brandsRaw.length === 0) {
    return {
      source: "BASELINE_FIXTURE",
      data: createBaselineRosterInput(year, month),
      message:
        "Supabase returned 0 employees or brands; falling back to deterministic baseline fixture.",
    };
  }

  // Load calendar overrides if a default calendar is found
  const defaultCalendar = calsRes.data?.find((c) => c.is_default) ?? calsRes.data?.[0];
  let calendarOverrides: { overrideDate: string; isOperating: boolean; reason?: string }[] = [];

  if (defaultCalendar?.id) {
    const overridesRes = await db
      .from("operating_calendar_overrides")
      .select("override_date, is_operating, reason")
      .eq("calendar_id", defaultCalendar.id);

    if (!overridesRes.error && overridesRes.data) {
      calendarOverrides = overridesRes.data.map((o) => ({
        overrideDate: o.override_date,
        isOperating: o.is_operating,
        reason: o.reason ?? undefined,
      }));
    }
  }

  // Load existing entries if already persisted for this month
  let existingEntries: RosterEntry[] | undefined;
  const monthRes = await db
    .from("roster_months")
    .select("id")
    .eq("year", year)
    .eq("month", month)
    .maybeSingle();

  if (monthRes.data?.id) {
    const entriesRes = await db
      .from("roster_entries")
      .select("work_date, employee_id, brand_id, pod_id, process_id, source")
      .eq("roster_month_id", monthRes.data.id);

    if (!entriesRes.error && entriesRes.data && entriesRes.data.length > 0) {
      existingEntries = entriesRes.data.map((e) => ({
        workDate: e.work_date,
        employeeId: e.employee_id,
        brandId: e.brand_id,
        podId: e.pod_id,
        processId: e.process_id,
        source: e.source as "GENERATED" | "MANUAL_EDIT",
      }));
    }
  }

  const mappedFixture: BaselineRosterFixture = {
    year,
    month,
    pods: pods.map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      description: `Operational Pod ${p.code}`,
    })),
    processes: processes.map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      description: `Workflow Process ${p.code}`,
    })),
    employees: employeesRaw.map((e) => ({
      id: e.id,
      employeeCode: e.employee_code,
      fullName: e.full_name,
      podId: e.pod_id,
      primaryProcessId: e.primary_process_id,
      isActive: e.is_active,
    })),
    brands: brandsRaw.map((b) => ({
      id: b.id,
      code: b.code,
      name: b.name,
      staffingMode: b.staffing_mode as "DEDICATED_SINGLE" | "SHARED_MULTI",
      podId: b.pod_id,
      processId: b.process_id,
      isActive: b.is_active,
    })),
    assignments: (assignsRes.data ?? []).map((a) => ({
      brandId: a.brand_id,
      employeeId: a.employee_id,
      isPrimary: a.is_primary,
    })),
    calendar: {
      id: defaultCalendar?.id ?? "cal-default",
      name: defaultCalendar?.name ?? "Standard Operating Calendar (Mon–Sat)",
      operatingDays: (defaultCalendar?.operating_days as number[]) ?? [1, 2, 3, 4, 5, 6],
      isDefault: defaultCalendar?.is_default ?? true,
    },
    calendarOverrides,
    timeOffs: (timeOffsRes.data ?? []).map((t) => ({
      employeeId: t.employee_id,
      timeOffDate: t.time_off_date,
      kind: t.kind as "WEEKLY_OFF" | "LEAVE" | "COMP_OFF",
      status: t.status as "PENDING" | "APPROVED" | "REJECTED",
      notes: t.notes ?? undefined,
    })),
    staffingRules: (rulesRes.data ?? []).map((r) => ({
      id: r.id,
      brandId: r.brand_id,
      podId: r.pod_id,
      processId: r.process_id,
      minHeadcount: r.min_headcount,
      effectiveFrom: r.effective_from,
      effectiveTo: r.effective_to,
    })),
  };

  return {
    source: "SUPABASE",
    data: mappedFixture,
    existingEntries,
    message: `Loaded ${mappedFixture.employees.length} operators and ${mappedFixture.brands.length} brands from Supabase.`,
  };
}

export async function loadRosterData(
  year = 2026,
  month = 12,
  client?: SupabaseClient
): Promise<LoadedRosterResult> {
  // If client passed directly, use it
  if (client) {
    return loadRosterInputFromDb(client, year, month);
  }

  // Check server environment variables safely
  const envCheck = getServerSupabaseEnv();
  if (!envCheck.success) {
    return {
      source: "BASELINE_FIXTURE",
      data: createBaselineRosterInput(year, month),
      message:
        "Supabase is not configured (missing environment variables). Operating cleanly with deterministic baseline fixture.",
    };
  }

  try {
    const adminDb = createSupabaseAdminClient();
    return await loadRosterInputFromDb(adminDb, year, month);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      source: "BASELINE_FIXTURE",
      data: createBaselineRosterInput(year, month),
      message: `Failed to load from Supabase (${msg}); falling back to deterministic baseline fixture.`,
    };
  }
}
