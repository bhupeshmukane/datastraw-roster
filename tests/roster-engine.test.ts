import { describe, expect, it } from "vitest";
import {
  generateMonthlyRoster,
  validateRosterEntries,
  type RosterEngineInput,
} from "@/lib/roster/engine";

function createFixture(): RosterEngineInput {
  const pods = Array.from({ length: 5 }, (_, i) => ({
    id: `pod-${i + 1}`,
    code: `POD-${i + 1}`,
    name: `Pod ${i + 1}`,
  }));

  const processes = Array.from({ length: 4 }, (_, i) => ({
    id: `proc-${i + 1}`,
    code: `PROC-${i + 1}`,
    name: `Process ${i + 1}`,
  }));

  const employees = Array.from({ length: 30 }, (_, i) => ({
    id: `emp-${i + 1}`,
    employeeCode: `EMP-${String(i + 1).padStart(2, "0")}`,
    fullName: `Operator ${i + 1}`,
    podId: pods[i % pods.length].id,
    primaryProcessId: processes[i % processes.length].id,
    isActive: true,
  }));

  // 16 DEDICATED_SINGLE (80%) + 4 SHARED_MULTI (20%) = 20 brands
  const brands = Array.from({ length: 20 }, (_, i) => {
    const isDedicated = i < 16;
    return {
      id: `brand-${i + 1}`,
      code: `BR-${String(i + 1).padStart(2, "0")}`,
      name: `Brand ${i + 1}`,
      staffingMode: isDedicated
        ? ("DEDICATED_SINGLE" as const)
        : ("SHARED_MULTI" as const),
      podId: pods[i % pods.length].id,
      processId: processes[i % processes.length].id,
      isActive: true,
    };
  });

  const assignments = [
    ...brands.slice(0, 16).map((b, idx) => ({
      brandId: b.id,
      employeeId: employees[idx].id,
      isPrimary: true,
    })),
    ...brands.slice(16).flatMap((b, idx) => [
      {
        brandId: b.id,
        employeeId: employees[16 + idx * 2].id,
        isPrimary: true,
      },
      {
        brandId: b.id,
        employeeId: employees[17 + idx * 2].id,
        isPrimary: false,
      },
    ]),
  ];

  return {
    year: 2026,
    month: 12,
    employees,
    brands,
    assignments,
    calendar: {
      id: "cal-default",
      name: "Standard Mon-Sat",
      operatingDays: [1, 2, 3, 4, 5, 6],
      isDefault: true,
    },
    calendarOverrides: [],
    timeOffs: [
      {
        employeeId: "emp-1",
        timeOffDate: "2026-12-01",
        kind: "LEAVE",
        status: "APPROVED",
      },
      {
        employeeId: "emp-2",
        timeOffDate: "2026-12-01",
        kind: "WEEKLY_OFF",
        status: "APPROVED",
      },
      {
        employeeId: "emp-3",
        timeOffDate: "2026-12-02",
        kind: "COMP_OFF",
        status: "APPROVED",
      },
    ],
    staffingRules: [],
  };
}

describe("Datastraw deterministic roster engine", () => {
  it("produces identical roster entries across repeated runs", () => {
    const fixture = createFixture();
    const runA = generateMonthlyRoster(fixture);
    const runB = generateMonthlyRoster(fixture);

    expect(runA.entries).toEqual(runB.entries);
    expect(runA.conflicts).toEqual(runB.conflicts);
  });

  it("excludes employees on approved LEAVE, WEEKLY_OFF, or COMP_OFF on their off dates", () => {
    const fixture = createFixture();
    const { entries } = generateMonthlyRoster(fixture);

    expect(
      entries.some((e) => e.workDate === "2026-12-01" && e.employeeId === "emp-1")
    ).toBe(false);
    expect(
      entries.some((e) => e.workDate === "2026-12-01" && e.employeeId === "emp-2")
    ).toBe(false);
    expect(
      entries.some((e) => e.workDate === "2026-12-02" && e.employeeId === "emp-3")
    ).toBe(false);
  });

  it("detects conflicts when manually assigning an employee on approved time-off", () => {
    const fixture = createFixture();
    const { entries } = generateMonthlyRoster(fixture);

    const mutated = [
      ...entries,
      {
        workDate: "2026-12-01",
        employeeId: "emp-1",
        brandId: "brand-1",
        podId: "pod-1",
        processId: "proc-1",
        source: "MANUAL_EDIT" as const,
      },
    ];

    const result = validateRosterEntries({
      ...fixture,
      entries: mutated,
    });

    expect(result.valid).toBe(false);
    expect(
      result.conflicts.some(
        (c) =>
          c.conflictType === "EMPLOYEE_TIME_OFF" &&
          c.employeeId === "emp-1" &&
          c.workDate === "2026-12-01"
      )
    ).toBe(true);
  });
});