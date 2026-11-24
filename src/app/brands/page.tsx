import { createBaselineRosterInput } from "@/lib/roster/baseline-fixture";
import { generateMonthlyRoster, getMonthDates, isOperatingDay } from "@/lib/roster/engine";

export default function BrandManagementPage() {
  const input = createBaselineRosterInput(2026, 12);
  const { entries, conflicts } = generateMonthlyRoster(input);
  const dates = getMonthDates(input.year, input.month);
  const operatingDates = dates.filter((d) =>
    isOperatingDay(d, input.calendar, input.calendarOverrides)
  );

  const dedicatedBrands = input.brands.filter(
    (b) => b.staffingMode === "DEDICATED_SINGLE"
  );
  const sharedBrands = input.brands.filter(
    (b) => b.staffingMode === "SHARED_MULTI"
  );

  const employeeNameById = new Map(
    input.employees.map((e) => [e.id, `${e.employeeCode} · ${e.fullName}`])
  );
  const podById = new Map(input.pods.map((p) => [p.id, p]));
  const processById = new Map(input.processes.map((p) => [p.id, p]));

  // Index conflicts by brandId
  const conflictsByBrand = new Map<string, number>();
  for (const c of conflicts) {
    if (c.brandId) {
      conflictsByBrand.set(c.brandId, (conflictsByBrand.get(c.brandId) ?? 0) + 1);
    }
  }

  // Index assigned shifts per brand
  const shiftsByBrand = new Map<string, number>();
  for (const entry of entries) {
    shiftsByBrand.set(
      entry.brandId,
      (shiftsByBrand.get(entry.brandId) ?? 0) + 1
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-[4px] bg-[#EEF2FF] px-2 py-0.5 text-[11px] font-semibold text-[#4F46E5]">
              D2C PORTFOLIO
            </span>
            <span className="text-[13px] text-[#64748B]">
              Dedicated Single-Owner & Shared Multi Staffing
            </span>
          </div>
          <h1 className="mt-1 text-[28px] font-semibold leading-9 tracking-[-0.02em] text-[#0F172A]">
            Brand Management
          </h1>
          <p className="mt-0.5 text-[14px] text-[#334155] tabular-nums">
            {input.brands.length} D2C brands: {dedicatedBrands.length} dedicated single-owner (80%) and {sharedBrands.length} multi-operator shared accounts (20%).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-[4px] bg-[#ECFDF5] px-3 py-1.5 text-[12px] font-semibold text-[#10B981]">
            16 Dedicated · 4 Shared
          </span>
        </div>
      </div>

      {/* KPI Metric Summary Strip */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
            Managed Brands
          </span>
          <p className="mt-1 text-[24px] font-semibold text-[#0F172A] tabular-nums">
            {input.brands.length}
          </p>
          <p className="mt-1 text-[12px] text-[#64748B]">Active operational brands</p>
        </div>

        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
            Dedicated Isolation (80%)
          </span>
          <p className="mt-1 text-[24px] font-semibold text-[#4F46E5] tabular-nums">
            {dedicatedBrands.length} Brands
          </p>
          <p className="mt-1 text-[12px] text-[#64748B]">
            Strict dedicated operator model
          </p>
        </div>

        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
            Shared Multi (20%)
          </span>
          <p className="mt-1 text-[24px] font-semibold text-[#F59E0B] tabular-nums">
            {sharedBrands.length} Brands
          </p>
          <p className="mt-1 text-[12px] text-[#64748B]">
            Multi-operator coverage model
          </p>
        </div>

        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
            Required Operating Shifts
          </span>
          <p className="mt-1 text-[24px] font-semibold text-[#0F172A] tabular-nums">
            {operatingDates.length} / brand
          </p>
          <p className="mt-1 text-[12px] text-[#64748B]">
            Min 1 operator per operating day
          </p>
        </div>
      </section>

      {/* Enterprise Brands Data Table */}
      <div className="overflow-hidden rounded-[8px] border border-[#E2E8F0] bg-white shadow-xs">
        <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
          <h2 className="text-[14px] font-semibold text-[#0F172A]">
            D2C Brand Operational Directory & Staffing Mode
          </h2>
          <p className="text-[12px] text-[#64748B]">
            Staffing model, pod association, assigned operators, and coverage health.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
                <th className="px-4 py-2.5">Code</th>
                <th className="px-4 py-2.5">Brand Name</th>
                <th className="px-4 py-2.5">Staffing Mode</th>
                <th className="px-4 py-2.5">Assigned Operators</th>
                <th className="px-4 py-2.5">Pod</th>
                <th className="px-4 py-2.5">Core Process</th>
                <th className="px-4 py-2.5">Shifts Allocated</th>
                <th className="px-4 py-2.5">SLA Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[13px] text-[#334155]">
              {input.brands.map((brand) => {
                const assigned = input.assignments.filter(
                  (a) => a.brandId === brand.id
                );
                const pod = podById.get(brand.podId);
                const proc = processById.get(brand.processId);
                const shifts = shiftsByBrand.get(brand.id) ?? 0;
                const brandConflictsCount = conflictsByBrand.get(brand.id) ?? 0;
                const isDedicated = brand.staffingMode === "DEDICATED_SINGLE";

                return (
                  <tr
                    key={brand.id}
                    className="h-[44px] hover:bg-[#F8FAFC] transition-colors"
                  >
                    <td className="px-4 py-2 font-medium text-[#0F172A] tabular-nums">
                      {brand.code}
                    </td>
                    <td className="px-4 py-2 font-medium text-[#0F172A]">
                      {brand.name}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`rounded-[4px] px-2 py-0.5 text-[11px] font-semibold ${
                          isDedicated
                            ? "bg-[#EEF2FF] text-[#4F46E5]"
                            : "bg-[#FFFBEB] text-[#B45309]"
                        }`}
                      >
                        {brand.staffingMode}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-[12px]">
                      {assigned.map((a) => (
                        <div key={a.employeeId} className="truncate">
                          {employeeNameById.get(a.employeeId) ?? a.employeeId}
                          {a.isPrimary && (
                            <span className="ml-1 text-[10px] font-semibold text-[#4F46E5]">
                              (Primary)
                            </span>
                          )}
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-2">
                      <span className="rounded-[4px] bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-semibold text-[#334155]">
                        {pod ? pod.code : brand.podId}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-[12px] text-[#64748B]">
                      {proc ? proc.name : brand.processId}
                    </td>
                    <td className="px-4 py-2 font-medium text-[#0F172A] tabular-nums">
                      {shifts} shifts
                    </td>
                    <td className="px-4 py-2">
                      {brandConflictsCount === 0 ? (
                        <span className="rounded-[4px] bg-[#ECFDF5] px-2 py-0.5 text-[11px] font-semibold text-[#10B981]">
                          COMPLIANT
                        </span>
                      ) : (
                        <span className="rounded-[4px] bg-[#FEF2F2] px-2 py-0.5 text-[11px] font-semibold text-[#EF4444] tabular-nums">
                          {brandConflictsCount} GAP
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
