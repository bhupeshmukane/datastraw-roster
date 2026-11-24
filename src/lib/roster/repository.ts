import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import {
  IsoDateSchema,
  RosterConflictSchema,
  RosterEntrySchema,
  type RosterConflict,
  type RosterEntry,
} from "@/lib/validation/roster";

export const PersistRosterMonthPayloadSchema = z.object({
  rosterMonthId: z.string().min(1),
  entries: z.array(RosterEntrySchema),
  conflicts: z.array(RosterConflictSchema),
});

export type PersistRosterMonthPayload = z.infer<
  typeof PersistRosterMonthPayloadSchema
>;

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