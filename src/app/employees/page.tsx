import { createBaselineRosterInput } from "@/lib/roster/baseline-fixture";
import { generateMonthlyRoster, getMonthDates, isOperatingDay } from "@/lib/roster/engine";

export default function EmployeeManagementPage() {
  const input = createBaselineRosterInput(2026, 12);
  const { entries } = generateMonthlyRoster(input);
  const dates = getMonthDates(input.year, input.month);
  const operatingDates = dates.filter((d) =>
    isOperatingDay(d, input.calendar, input.calendarOverrides)
  );

  const podById = new Map(input.pods.map((p) => [p.id, p]));
  const processById = new Map(input.processes.map((p) => [p.id, p]));
  const brandById = new Map(input.brands.map((b) => [b.id, b]));

  // Index shift counts per employee
  const shiftsCountByEmp = new Map<string, number>();
  for (const entry of entries) {
    shiftsCountByEmp.set(
      entry.employeeId,
      (shiftsCountByEmp.get(entry.employeeId) ?? 0) + 1
    );
  }

  // Index brands assigned to each employee
  const brandsByEmp = new Map<string, { code: string; isPrimary: boolean }[]>();
  for (const a of input.assignments) {
    const brand = brandById.get(a.brandId);
    if (!brand) continue;
    const current = brandsByEmp.get(a.employeeId) ?? [];
    current.push({ code: brand.code, isPrimary: a.isPrimary });
    brandsByEmp.set(a.employeeId, current);
  }

  // Index time-offs by employee
  const timeOffByEmp = new Map<string, string>();
  for (const t of input.timeOffs) {
    timeOffByEmp.set(t.employeeId, `${t.kind} (${t.timeOffDate.slice(-5)})`);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-[4px] bg-[#EEF2FF] px-2 py-0.5 text-[11px] font-semibold text-[#4F46E5]">
              WORKFORCE DIRECTORY
            </span>
            <span className="text-[13px] text-[#64748B]">
              Deterministic Skill & Pod Mapping
            </span>
          </div>
          <h1 className="mt-1 text-[28px] font-semibold leading-9 tracking-[-0.02em] text-[#0F172A]">
            Employee Management
          </h1>
          <p className="mt-0.5 text-[14px] text-[#334155] tabular-nums">
            {input.employees.length} active operators mapped across {input.pods.length} pods and {input.processes.length} operational processes.
          </p>
        </div>

        <span className="rounded-[4px] bg-[#ECFDF5] px-3 py-1.5 text-[12px] font-semibold text-[#10B981]">
          100% Shift Allocation Verified
        </span>
      </div>

      {/* KPI Metric Summary Strip */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
            Total Headcount
          </span>
          <p className="mt-1 text-[24px] font-semibold text-[#0F172A] tabular-nums">
            {input.employees.length}
          </p>
          <p className="mt-1 text-[12px] text-[#64748B]">Active operational staff</p>
        </div>

        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
            Dedicated Brand Staff
          </span>
          <p className="mt-1 text-[24px] font-semibold text-[#4F46E5] tabular-nums">
            16
          </p>
          <p className="mt-1 text-[12px] text-[#64748B]">
            Strict 1:1 single-brand isolation
          </p>
        </div>

        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
            Shared Multi-Brand Staff
          </span>
          <p className="mt-1 text-[24px] font-semibold text-[#F59E0B] tabular-nums">
            14
          </p>
          <p className="mt-1 text-[12px] text-[#64748B]">
            Flex across 4 shared brand accounts
          </p>
        </div>

        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
            Operating Days in Scope
          </span>
          <p className="mt-1 text-[24px] font-semibold text-[#0F172A] tabular-nums">
            {operatingDates.length}
          </p>
          <p className="mt-1 text-[12px] text-[#64748B]">
            Standard Mon–Sat operating schedule
          </p>
        </div>
      </section>

      {/* Enterprise Data Table */}
      <div className="overflow-hidden rounded-[8px] border border-[#E2E8F0] bg-white shadow-xs">
        <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
          <h2 className="text-[14px] font-semibold text-[#0F172A]">
            Operator Roster Profile & Process Assignment
          </h2>
          <p className="text-[12px] text-[#64748B]">
            Detailed staffing configuration, pod affiliation, brand mapping, and monthly shift load.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
                <th className="px-4 py-2.5">Code</th>
                <th className="px-4 py-2.5">Operator Name</th>
                <th className="px-4 py-2.5">Pod</th>
                <th className="px-4 py-2.5">Primary Process</th>
                <th className="px-4 py-2.5">Brand Assignments</th>
                <th className="px-4 py-2.5">Monthly Shifts</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[13px] text-[#334155]">
              {input.employees.map((emp) => {
                const pod = podById.get(emp.podId);
                const proc = processById.get(emp.primaryProcessId);
                const assignedBrands = brandsByEmp.get(emp.id) ?? [];
                const shifts = shiftsCountByEmp.get(emp.id) ?? 0;
                const timeOffInfo = timeOffByEmp.get(emp.id);

                return (
                  <tr
                    key={emp.id}
                    className="h-[44px] hover:bg-[#F8FAFC] transition-colors"
                  >
                    <td className="px-4 py-2 font-medium text-[#0F172A] tabular-nums">
                      {emp.employeeCode}
                    </td>
                    <td className="px-4 py-2 font-medium text-[#0F172A]">
                      {emp.fullName}
                    </td>
                    <td className="px-4 py-2">
                      <span className="rounded-[4px] bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-semibold text-[#334155]">
                        {pod ? pod.code : emp.podId}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-[12px] text-[#64748B]">
                      {proc ? proc.name : emp.primaryProcessId}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-wrap gap-1">
                        {assignedBrands.length > 0 ? (
                          assignedBrands.map((b) => (
                            <span
                              key={b.code}
                              className={`rounded-[4px] px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
                                b.isPrimary
                                  ? "bg-[#EEF2FF] text-[#4F46E5]"
                                  : "bg-[#F1F5F9] text-[#64748B]"
                              }`}
                            >
                              {b.code}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-[#94A3B8]">
                            Flex Pool
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 font-medium text-[#0F172A] tabular-nums">
                      {shifts} shifts
                    </td>
                    <td className="px-4 py-2">
                      {timeOffInfo ? (
                        <span className="rounded-[4px] bg-[#FFFBEB] px-2 py-0.5 text-[11px] font-semibold text-[#B45309]">
                          {timeOffInfo}
                        </span>
                      ) : (
                        <span className="rounded-[4px] bg-[#ECFDF5] px-2 py-0.5 text-[11px] font-semibold text-[#10B981]">
                          ACTIVE
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
