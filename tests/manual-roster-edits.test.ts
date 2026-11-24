import { describe, expect, it } from "vitest";
import { createBaselineRosterInput } from "@/lib/roster/baseline-fixture";
import {
  generateMonthlyRoster,
  validateRosterEntries,
} from "@/lib/roster/engine";
import type { RosterEntry } from "@/lib/validation/roster";
import {
  checkSupabaseConfigAction,
  persistRosterMonthAction,
} from "@/app/actions/roster";

describe("Manual roster edits, revalidation, and conflicts", () => {
  it("preserves source: MANUAL_EDIT on manually modified entries", () => {
    const fixture = createBaselineRosterInput(2026, 12);
    const { entries } = generateMonthlyRoster(fixture);

    // Filter out prior entry for brand-17 on 2026-12-02 and add manual edit
    const workDate = "2026-12-02";
    const manualEntry: RosterEntry = {
      workDate,
      employeeId: "emp-25",
      brandId: "brand-17",
      podId: "pod-5",
      processId: "proc-1",
      source: "MANUAL_EDIT",
    };

    const modifiedEntries = [
      ...entries.filter(
        (e) => !(e.workDate === workDate && e.brandId === "brand-17")
      ),
      manualEntry,
    ];

    expect(
      modifiedEntries.find(
        (e) => e.workDate === workDate && e.brandId === "brand-17"
      )?.source
    ).toBe("MANUAL_EDIT");

    const validation = validateRosterEntries({
      ...fixture,
      entries: modifiedEntries,
    });
    // emp-25 is an active employee, brand-17 is active shared brand
    expect(validation).toBeDefined();
  });

  it("triggers DEDICATED_BRAND_VIOLATION when assigning a dedicated employee outside their brand", () => {
    const fixture = createBaselineRosterInput(2026, 12);
    const { entries } = generateMonthlyRoster(fixture);

    // emp-1 is dedicated primary for brand-1
    // Manually assign emp-1 to brand-2 on 2026-12-02
    const workDate = "2026-12-02";
    const violatingEntry: RosterEntry = {
      workDate,
      employeeId: "emp-1",
      brandId: "brand-2",
      podId: "pod-1",
      processId: "proc-1",
      source: "MANUAL_EDIT",
    };

    const modifiedEntries = [
      ...entries.filter(
        (e) => !(e.workDate === workDate && e.employeeId === "emp-1")
      ),
      violatingEntry,
    ];

    const validation = validateRosterEntries({
      ...fixture,
      entries: modifiedEntries,
    });

    const dedicatedConflict = validation.conflicts.find(
      (c) =>
        c.conflictType === "DEDICATED_BRAND_VIOLATION" &&
        c.workDate === workDate &&
        c.employeeId === "emp-1"
    );

    expect(dedicatedConflict).toBeDefined();
    expect(dedicatedConflict?.severity).toBe("HIGH");
    expect(dedicatedConflict?.description).toContain("brand-2");
  });

  it("triggers EMPLOYEE_TIME_OFF conflict when scheduling on an approved leave date", () => {
    const fixture = createBaselineRosterInput(2026, 12);
    const { entries } = generateMonthlyRoster(fixture);

    // emp-18 has approved COMP_OFF on 2026-12-19
    const timeOffDate = "2026-12-19";
    const manualEntry: RosterEntry = {
      workDate: timeOffDate,
      employeeId: "emp-18",
      brandId: "brand-18",
      podId: "pod-4",
      processId: "proc-2",
      source: "MANUAL_EDIT",
    };

    const modifiedEntries = [...entries, manualEntry];

    const validation = validateRosterEntries({
      ...fixture,
      entries: modifiedEntries,
    });

    const timeOffConflict = validation.conflicts.find(
      (c) =>
        c.conflictType === "EMPLOYEE_TIME_OFF" &&
        c.workDate === timeOffDate &&
        c.employeeId === "emp-18"
    );

    expect(timeOffConflict).toBeDefined();
    expect(timeOffConflict?.severity).toBe("HIGH");
    expect(timeOffConflict?.description).toContain("approved time-off");
  });

  it("triggers DOUBLE_BOOKED_EMPLOYEE conflict when an operator is scheduled twice on the same date", () => {
    const fixture = createBaselineRosterInput(2026, 12);
    const { entries } = generateMonthlyRoster(fixture);

    const workDate = "2026-12-03";
    // emp-2 is already scheduled on brand-2 on 2026-12-03
    // Manually add a second assignment for emp-2 on brand-17
    const doubleEntry: RosterEntry = {
      workDate,
      employeeId: "emp-2",
      brandId: "brand-17",
      podId: "pod-2",
      processId: "proc-1",
      source: "MANUAL_EDIT",
    };

    const modifiedEntries = [...entries, doubleEntry];

    const validation = validateRosterEntries({
      ...fixture,
      entries: modifiedEntries,
    });

    const doubleConflict = validation.conflicts.find(
      (c) =>
        c.conflictType === "DOUBLE_BOOKED_EMPLOYEE" &&
        c.workDate === workDate &&
        c.employeeId === "emp-2"
    );

    expect(doubleConflict).toBeDefined();
    expect(doubleConflict?.severity).toBe("HIGH");
  });

  it("triggers UNDERSTAFFED_BRAND when removing a shift and resolves when reassigning a valid operator", () => {
    const fixture = createBaselineRosterInput(2026, 12);
    const { entries } = generateMonthlyRoster(fixture);

    const workDate = "2026-12-04";
    // brand-3 has 1 required employee. Remove the shift for brand-3:
    const withoutBrand3 = entries.filter(
      (e) => !(e.workDate === workDate && e.brandId === "brand-3")
    );

    const validationAfterRemoval = validateRosterEntries({
      ...fixture,
      entries: withoutBrand3,
    });

    const understaffed = validationAfterRemoval.conflicts.find(
      (c) =>
        c.conflictType === "UNDERSTAFFED_BRAND" &&
        c.workDate === workDate &&
        c.brandId === "brand-3"
    );
    expect(understaffed).toBeDefined();

    // Now reassign dedicated emp-3 back:
    const reassignedEntries: RosterEntry[] = [
      ...withoutBrand3,
      {
        workDate,
        employeeId: "emp-3",
        brandId: "brand-3",
        podId: "pod-3",
        processId: "proc-3",
        source: "MANUAL_EDIT",
      },
    ];

    const validationAfterReassign = validateRosterEntries({
      ...fixture,
      entries: reassignedEntries,
    });

    const resolvedConflict = validationAfterReassign.conflicts.find(
      (c) =>
        c.conflictType === "UNDERSTAFFED_BRAND" &&
        c.workDate === workDate &&
        c.brandId === "brand-3"
    );
    expect(resolvedConflict).toBeUndefined();
  });

  it("server actions provide honest unconfigured status without exposing secret keys", async () => {
    const configStatus = await checkSupabaseConfigAction();
    expect(configStatus).toHaveProperty("configured");
    expect(configStatus).toHaveProperty("message");
    // Ensure no service role key is leaked in the message
    expect(configStatus.message).not.toContain("eyJh");

    const persistResult = await persistRosterMonthAction({
      rosterMonthId: "test-month",
      entries: [],
      conflicts: [],
    });

    expect(persistResult.success).toBe(false);
    expect(persistResult.configured).toBe(false);
    expect(persistResult.message).toContain("Cannot persist to Supabase");
    // Explicitly verify no service role key is in the message
    expect(persistResult.message).not.toContain("eyJh");
  });
});
