import { describe, expect, it } from "vitest";
import { createBaselineRosterInput } from "@/lib/roster/baseline-fixture";
import { generateMonthlyRoster, validateRosterEntries } from "@/lib/roster/engine";

describe("Deterministic baseline fixture helper", () => {
  it("creates a valid baseline fixture with required topology", () => {
    const fixture = createBaselineRosterInput(2026, 12);

    // 30 employees
    expect(fixture.employees).toHaveLength(30);

    // 20 brands with 16 DEDICATED_SINGLE and 4 SHARED_MULTI
    expect(fixture.brands).toHaveLength(20);
    const dedicatedBrands = fixture.brands.filter(
      (b) => b.staffingMode === "DEDICATED_SINGLE"
    );
    const sharedBrands = fixture.brands.filter(
      (b) => b.staffingMode === "SHARED_MULTI"
    );
    expect(dedicatedBrands).toHaveLength(16);
    expect(sharedBrands).toHaveLength(4);

    // 5 pods and 4 processes
    expect(fixture.pods).toHaveLength(5);
    expect(fixture.processes).toHaveLength(4);

    // Dedicated assignments: exactly 16 dedicated assignments
    const dedicatedAssignments = fixture.assignments.filter((a) =>
      dedicatedBrands.some((db) => db.id === a.brandId)
    );
    expect(dedicatedAssignments).toHaveLength(16);
  });

  it("generates deterministic monthly roster without dedicated boundary violations", () => {
    const fixture = createBaselineRosterInput(2026, 12);
    const runA = generateMonthlyRoster(fixture);
    const runB = generateMonthlyRoster(fixture);

    expect(runA.entries).toEqual(runB.entries);
    expect(runA.conflicts).toEqual(runB.conflicts);

    // Validate entries directly
    const validation = validateRosterEntries({
      ...fixture,
      entries: runA.entries,
    });

    // Check that there are zero dedicated brand violations
    const dedicatedViolations = validation.conflicts.filter(
      (c) => c.conflictType === "DEDICATED_BRAND_VIOLATION"
    );
    expect(dedicatedViolations).toHaveLength(0);

    // Check that no shifts are scheduled on the holiday override (Dec 25)
    const holidayShifts = runA.entries.filter(
      (e) => e.workDate === "2026-12-25"
    );
    expect(holidayShifts).toHaveLength(0);

    // Check that employee on leave on Dec 8 has no shift on that date
    const leaveShifts = runA.entries.filter(
      (e) => e.employeeId === "emp-1" && e.workDate === "2026-12-08"
    );
    expect(leaveShifts).toHaveLength(0);
  });
});
