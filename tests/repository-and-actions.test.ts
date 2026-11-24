import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  loadRosterData,
  loadRosterInputFromDb,
  upsertManualRosterEntry,
  resolveRosterConflict,
} from "@/lib/roster/repository";
import {
  loadRosterDataAction,
  persistRosterMonthAction,
  persistManualEditAction,
  resolveConflictAction,
} from "@/app/actions/roster";

describe("Repository data loading & server actions", () => {
  it("verifies the seed migration file exists with required operational entities", () => {
    const migrationPath = path.resolve(
      process.cwd(),
      "supabase/migrations/202611240002_seed_baseline_ops.sql"
    );
    expect(fs.existsSync(migrationPath)).toBe(true);

    const content = fs.readFileSync(migrationPath, "utf-8");
    // Check 5 pods
    expect(content).toContain("POD-A");
    expect(content).toContain("POD-E");
    // Check 4 processes
    expect(content).toContain("PROC-ORDER");
    expect(content).toContain("PROC-SLA");
    // Check employees EMP-01 .. EMP-30
    expect(content).toContain("EMP-01");
    expect(content).toContain("EMP-30");
    // Check 20 brands with 16 DEDICATED_SINGLE and 4 SHARED_MULTI
    expect(content).toContain("BR-01");
    expect(content).toContain("BR-20");
    expect(content).toContain("DEDICATED_SINGLE");
    expect(content).toContain("SHARED_MULTI");
    // Check operating calendar and holiday override
    expect(content).toContain("Standard Operating Calendar (Mon–Sat)");
    expect(content).toContain("2026-12-25");
  });

  it("loadRosterData explicitly falls back to deterministic baseline when Supabase is unconfigured", async () => {
    const result = await loadRosterData(2026, 12);
    expect(result.source).toBe("BASELINE_FIXTURE");
    expect(result.data.employees).toHaveLength(30);
    expect(result.data.brands).toHaveLength(20);
    expect(result.data.pods).toHaveLength(5);
    expect(result.data.processes).toHaveLength(4);
    expect(result.message).toContain("deterministic baseline fixture");
  });

  it("loadRosterInputFromDb correctly maps database rows when records are present", async () => {
    const mockDb = {
      from: (table: string) => {
        if (table === "pods") {
          return {
            select: () =>
              Promise.resolve({
                data: [{ id: "p1", code: "POD-A", name: "Pod A" }],
                error: null,
              }),
          };
        }
        if (table === "processes") {
          return {
            select: () =>
              Promise.resolve({
                data: [{ id: "pr1", code: "PROC-ORDER", name: "Order Ops" }],
                error: null,
              }),
          };
        }
        if (table === "employees") {
          return {
            select: () => ({
              eq: () =>
                Promise.resolve({
                  data: [
                    {
                      id: "e1",
                      employee_code: "EMP-01",
                      full_name: "Test Operator",
                      pod_id: "p1",
                      primary_process_id: "pr1",
                      is_active: true,
                    },
                  ],
                  error: null,
                }),
            }),
          };
        }
        if (table === "brands") {
          return {
            select: () => ({
              eq: () =>
                Promise.resolve({
                  data: [
                    {
                      id: "b1",
                      code: "BR-01",
                      name: "Brand 1",
                      staffing_mode: "DEDICATED_SINGLE",
                      pod_id: "p1",
                      process_id: "pr1",
                      is_active: true,
                    },
                  ],
                  error: null,
                }),
            }),
          };
        }
        if (table === "brand_assignments") {
          return {
            select: () =>
              Promise.resolve({
                data: [{ brand_id: "b1", employee_id: "e1", is_primary: true }],
                error: null,
              }),
          };
        }
        if (table === "operating_calendars") {
          return {
            select: () =>
              Promise.resolve({
                data: [
                  {
                    id: "c1",
                    name: "Default Cal",
                    operating_days: [1, 2, 3, 4, 5, 6],
                    is_default: true,
                  },
                ],
                error: null,
              }),
          };
        }
        if (table === "operating_calendar_overrides") {
          return {
            select: () => ({
              eq: () =>
                Promise.resolve({
                  data: [
                    {
                      override_date: "2026-12-25",
                      is_operating: false,
                      reason: "Holiday",
                    },
                  ],
                  error: null,
                }),
            }),
          };
        }
        if (table === "employee_time_offs") {
          return {
            select: () =>
              Promise.resolve({
                data: [],
                error: null,
              }),
          };
        }
        if (table === "minimum_staffing_rules") {
          return {
            select: () =>
              Promise.resolve({
                data: [
                  {
                    id: "r1",
                    brand_id: "b1",
                    pod_id: "p1",
                    process_id: "pr1",
                    min_headcount: 1,
                    effective_from: null,
                    effective_to: null,
                  },
                ],
                error: null,
              }),
          };
        }
        if (table === "roster_months") {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  maybeSingle: () => Promise.resolve({ data: null, error: null }),
                }),
              }),
            }),
          };
        }
        throw new Error(`Unhandled mock table: ${table}`);
      },
    } as unknown as SupabaseClient;

    const result = await loadRosterInputFromDb(mockDb, 2026, 12);
    expect(result.source).toBe("SUPABASE");
    expect(result.data.employees[0].employeeCode).toBe("EMP-01");
    expect(result.data.brands[0].code).toBe("BR-01");
    expect(result.data.calendarOverrides[0].overrideDate).toBe("2026-12-25");
  });

  it("upsertManualRosterEntry validates payload and executes upsert", async () => {
    let capturedRow: Record<string, unknown> | null = null;
    const mockDb = {
      from: (table: string) => {
        expect(table).toBe("roster_entries");
        return {
          upsert: (row: Record<string, unknown>) => {
            capturedRow = row;
            return Promise.resolve({ error: null });
          },
        };
      },
    } as unknown as SupabaseClient;

    const res = await upsertManualRosterEntry(mockDb, {
      rosterMonthId: "month-2026-12",
      workDate: "2026-12-10",
      employeeId: "emp-5",
      brandId: "brand-1",
      podId: "pod-1",
      processId: "proc-1",
    });

    expect(res.success).toBe(true);
    expect(capturedRow).not.toBeNull();
    expect(capturedRow?.["source"]).toBe("MANUAL_EDIT");
    expect(capturedRow?.["work_date"]).toBe("2026-12-10");
  });

  it("resolveRosterConflict executes update on target conflict row", async () => {
    let capturedUpdate: Record<string, unknown> | null = null;
    const mockDb = {
      from: (table: string) => {
        expect(table).toBe("roster_conflicts");
        return {
          update: (updates: Record<string, unknown>) => {
            capturedUpdate = updates;
            return {
              eq: () => ({
                eq: () => ({
                  eq: () => ({
                    is: () => Promise.resolve({ error: null }),
                  }),
                }),
              }),
            };
          },
        };
      },
    } as unknown as SupabaseClient;

    const res = await resolveRosterConflict(mockDb, {
      rosterMonthId: "month-2026-12",
      workDate: "2026-12-08",
      conflictType: "UNDERSTAFFED_BRAND",
      resolutionNote: "Covered by flex operator",
    });

    expect(res.success).toBe(true);
    expect(capturedUpdate?.["resolution_note"]).toBe("Covered by flex operator");
    expect(capturedUpdate?.["resolved_at"]).toBeDefined();
  });

  it("loadRosterDataAction validates input schema", async () => {
    await expect(
      loadRosterDataAction({ year: 1990, month: 12 })
    ).rejects.toThrow();

    await expect(
      loadRosterDataAction({ year: 2026, month: 15 })
    ).rejects.toThrow();

    const validResult = await loadRosterDataAction({ year: 2026, month: 12 });
    expect(validResult.success).toBe(true);
    expect(validResult.result.data.employees).toHaveLength(30);
  });

  it("persistManualEditAction validates schema and reports honest status", async () => {
    // Invalid date format
    const invalidRes = await persistManualEditAction({
      rosterMonthId: "m1",
      workDate: "invalid-date",
      employeeId: "emp-1",
      brandId: "b1",
      podId: "p1",
      processId: "pr1",
    });
    expect(invalidRes.success).toBe(false);
    expect(invalidRes.message).toContain("Invalid manual edit payload");

    // Valid schema when Supabase is unconfigured
    const unconfigRes = await persistManualEditAction({
      rosterMonthId: "m1",
      workDate: "2026-12-15",
      employeeId: "emp-1",
      brandId: "b1",
      podId: "p1",
      processId: "pr1",
    });
    expect(unconfigRes.success).toBe(false);
    expect(unconfigRes.configured).toBe(false);
    expect(unconfigRes.message).toContain("Supabase environment variables are not configured");
  });

  it("resolveConflictAction validates resolutionNote and reports honest status", async () => {
    // Empty resolution note
    const emptyNoteRes = await resolveConflictAction({
      rosterMonthId: "m1",
      workDate: "2026-12-08",
      conflictType: "UNDERSTAFFED_BRAND",
      resolutionNote: "",
    });
    expect(emptyNoteRes.success).toBe(false);
    expect(emptyNoteRes.message).toContain("Resolution note cannot be empty");

    // Valid payload without Supabase credentials
    const unconfigRes = await resolveConflictAction({
      rosterMonthId: "m1",
      workDate: "2026-12-08",
      conflictType: "UNDERSTAFFED_BRAND",
      resolutionNote: "Acknowledged in console",
    });
    expect(unconfigRes.success).toBe(false);
    expect(unconfigRes.configured).toBe(false);
    expect(unconfigRes.message).toContain("Supabase environment variables are not configured");
  });

  it("persistRosterMonthAction validates payload schema and prevents fake persistence", async () => {
    const invalidRes = await persistRosterMonthAction({
      rosterMonthId: "",
      entries: "not-an-array",
    });
    expect(invalidRes.success).toBe(false);
    expect(invalidRes.message).toContain("Invalid roster month payload");

    const unconfigRes = await persistRosterMonthAction({
      rosterMonthId: "month-2026-12",
      entries: [],
      conflicts: [],
    });
    expect(unconfigRes.success).toBe(false);
    expect(unconfigRes.configured).toBe(false);
    expect(unconfigRes.message).toContain("Cannot persist to Supabase");
  });
});
