import type { RosterEngineInput } from "@/lib/roster/engine";

export function createBaselineRosterInput(year = 2026, month = 12): RosterEngineInput {
  const pods = [
    { id: "pod-1", code: "POD-A", name: "Core D2C Pod A" },
    { id: "pod-2", code: "POD-B", name: "Growth D2C Pod B" },
    { id: "pod-3", code: "POD-C", name: "Retention & CX Pod C" },
    { id: "pod-4", code: "POD-D", name: "Fulfillment & Ops Pod D" },
    { id: "pod-5", code: "POD-E", name: "Catalog & Launch Pod E" },
  ];

  const processes = [
    { id: "proc-1", code: "PROC-ORDER", name: "Order & Dispatch Ops" },
    { id: "proc-2", code: "PROC-CX", name: "Customer Experience" },
    { id: "proc-3", code: "PROC-CATALOG", name: "Catalog & Inventory" },
    { id: "proc-4", code: "PROC-ESCALATION", name: "Escalations & SLA" },
  ];

  const employees = Array.from({ length: 30 }, (_, i) => ({
    id: `emp-${i + 1}`,
    employeeCode: `DS-${String(i + 1).padStart(2, "0")}`,
    fullName: `Operations Specialist ${i + 1}`,
    podId: pods[i % pods.length].id,
    primaryProcessId: processes[i % processes.length].id,
    isActive: true,
  }));

  const brands = Array.from({ length: 20 }, (_, i) => {
    const staffingMode =
      i < 16 ? ("DEDICATED_SINGLE" as const) : ("SHARED_MULTI" as const);
    return {
      id: `brand-${i + 1}`,
      code: `BR-${String(i + 1).padStart(2, "0")}`,
      name: `D2C Brand ${i + 1}`,
      staffingMode,
      podId: pods[i % pods.length].id,
      processId: processes[i % processes.length].id,
      isActive: true,
    };
  });

  const assignments = [
    ...brands.slice(0, 16).map((brand, idx) => ({
      brandId: brand.id,
      employeeId: employees[idx].id,
      isPrimary: true,
    })),
    ...brands.slice(16).flatMap((brand, idx) => [
      {
        brandId: brand.id,
        employeeId: employees[16 + idx * 2].id,
        isPrimary: true,
      },
      {
        brandId: brand.id,
        employeeId: employees[17 + idx * 2].id,
        isPrimary: false,
      },
    ]),
  ];

  return {
    year,
    month,
    employees,
    brands,
    assignments,
    calendar: {
      id: "cal-default",
      name: "Standard Operating Calendar (Mon-Sat)",
      operatingDays: [1, 2, 3, 4, 5, 6],
      isDefault: true,
    },
    calendarOverrides: [],
    timeOffs: [],
    staffingRules: [],
  };
}