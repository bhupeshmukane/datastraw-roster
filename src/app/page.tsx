import Link from "next/link";
import { createBaselineRosterInput } from "@/lib/roster/baseline-fixture";
import { generateMonthlyRoster, getMonthDates, isOperatingDay } from "@/lib/roster/engine";

export default function OperationsDashboardPage() {
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

  const totalPossibleBrandShifts = operatingDates.length * input.brands.length;
  const coverageRate = (
    (entries.length / Math.max(totalPossibleBrandShifts, 1)) *
    100
  ).toFixed(1);

  const employeeNameById = new Map(
    input.employees.map((e) => [e.id, `${e.employeeCode} · ${e.fullName}`])
  );
  const brandNameById = new Map(
    input.brands.map((b) => [b.id, `${b.code} · ${b.name}`])
  );
  const podNameById = new Map(input.pods.map((p) => [p.id, p.name]));
  const processNameById = new Map(input.processes.map((p) => [p.id, p.name]));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF5] px-2.5 py-0.5 text-[11px] font-semibold text-[#10B981]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
              LIVE OPERATIONS
            </span>
            <span className="text-[13px] text-[#64748B]">
              Deterministic Cycle: {input.year}-12 ({dates.length} Days)
            </span>
          </div>
          <h1 className="mt-1 text-[28px] font-semibold leading-9 tracking-[-0.02em] text-[#0F172A]">
            Operations Dashboard
          </h1>
          <p className="mt-0.5 text-[14px] text-[#334155]">
            Operational command center managing 30 operators, 20 D2C brands, 5 pods, and 4 core processes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/roster"
            className="rounded-[4px] bg-[#4F46E5] px-4 py-2 text-[13px] font-medium text-white shadow-xs transition hover:bg-[#3525CD]"
          >
            View Monthly Roster
          </Link>
          <Link
            href="/validation"
            className="rounded-[4px] border border-[#E2E8F0] bg-white px-4 py-2 text-[13px] font-medium text-[#334155] shadow-xs transition hover:bg-[#F8FAFC]"
          >
            Audit Validation Rules
          </Link>
        </div>
      </div>

      {/* 5 KPI Precision Operational Metric Cards */}
      <section aria-label="Key Operational Metrics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* KPI 1: Workforce Capacity */}
        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
            Total Workforce
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[28px] font-semibold tracking-[-0.02em] text-[#0F172A] tabular-nums">
              {input.employees.length}
            </span>
            <span className="text-[12px] text-[#64748B]">Operators</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="font-medium text-[#10B981]">100% Active</span>
            <span className="text-[#64748B] tabular-nums">5 Pods</span>
          </div>
        </div>

        {/* KPI 2: D2C Brands */}
        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
            Managed Brands
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[28px] font-semibold tracking-[-0.02em] text-[#0F172A] tabular-nums">
              {input.brands.length}
            </span>
            <span className="text-[12px] text-[#64748B]">D2C Portfolios</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-[#4F46E5] font-medium tabular-nums">
              {dedicatedBrands.length} Dedicated (80%)
            </span>
            <span className="text-[#64748B] tabular-nums">
              {sharedBrands.length} Shared
            </span>
          </div>
        </div>

        {/* KPI 3: Operational Processes */}
        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
            Active Processes
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[28px] font-semibold tracking-[-0.02em] text-[#0F172A] tabular-nums">
              {input.processes.length}
            </span>
            <span className="text-[12px] text-[#64748B]">Pipelines</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="font-medium text-[#10B981]">Order · CX · Catalog · SLA</span>
          </div>
        </div>

        {/* KPI 4: Roster Completion */}
        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
            Roster Completion
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[28px] font-semibold tracking-[-0.02em] text-[#0F172A] tabular-nums">
              {coverageRate}%
            </span>
            <span className="text-[12px] text-[#64748B] tabular-nums">
              {entries.length} Shifts
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
            <div
              className="h-full rounded-full bg-[#4F46E5]"
              style={{ width: `${coverageRate}%` }}
            ></div>
          </div>
        </div>

        {/* KPI 5: Active Conflicts */}
        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
            Roster Conflicts
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[28px] font-semibold tracking-[-0.02em] text-[#0F172A] tabular-nums">
              {conflicts.length}
            </span>
            <span className="text-[12px] text-[#64748B]">Flagged Items</span>
          </div>
          <div className="mt-2">
            <span
              className={`rounded-[4px] px-2 py-0.5 text-[11px] font-semibold ${
                conflicts.length === 0
                  ? "bg-[#ECFDF5] text-[#10B981]"
                  : "bg-[#FEF2F2] text-[#EF4444]"
              }`}
            >
              {conflicts.length === 0 ? "Zero Gaps" : "Understaffed Shift"}
            </span>
          </div>
        </div>
      </section>

      {/* Grid: Pod Breakdown & Process Alignment */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Pods Breakdown */}
        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div>
              <h2 className="text-[16px] font-semibold text-[#0F172A]">
                Operational Pods ({input.pods.length})
              </h2>
              <p className="text-[12px] text-[#64748B]">
                Balanced workforce distribution across 5 core units
              </p>
            </div>
            <span className="rounded-[4px] bg-[#F1F5F9] px-2 py-1 text-[11px] font-semibold text-[#334155] tabular-nums">
              6 Staff / Pod
            </span>
          </div>

          <div className="mt-3 divide-y divide-[#E2E8F0]">
            {input.pods.map((pod) => {
              const podEmployees = input.employees.filter((e) => e.podId === pod.id);
              const podBrands = input.brands.filter((b) => b.podId === pod.id);

              return (
                <div key={pod.id} className="py-3 first:pt-1 last:pb-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-[13px] text-[#0F172A]">
                        {pod.name}
                      </span>
                      <span className="ml-2 rounded-[4px] bg-[#EEF2FF] px-1.5 py-0.5 text-[11px] font-semibold text-[#4F46E5]">
                        {pod.code}
                      </span>
                    </div>
                    <div className="text-[12px] text-[#64748B] tabular-nums">
                      <span className="font-medium text-[#0F172A]">
                        {podEmployees.length} operators
                      </span>
                      {" · "}
                      <span>{podBrands.length} brands</span>
                    </div>
                  </div>
                  <p className="mt-1 text-[12px] text-[#64748B]">
                    {pod.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operational Processes Breakdown */}
        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div>
              <h2 className="text-[16px] font-semibold text-[#0F172A]">
                Core Operational Processes ({input.processes.length})
              </h2>
              <p className="text-[12px] text-[#64748B]">
                Primary workflow responsibilities across operator skills
              </p>
            </div>
            <span className="rounded-[4px] bg-[#ECFDF5] px-2 py-1 text-[11px] font-semibold text-[#10B981]">
              Engine Verified
            </span>
          </div>

          <div className="mt-3 divide-y divide-[#E2E8F0]">
            {input.processes.map((proc) => {
              const procEmployees = input.employees.filter(
                (e) => e.primaryProcessId === proc.id
              );
              const procBrands = input.brands.filter((b) => b.processId === proc.id);

              return (
                <div key={proc.id} className="py-3 first:pt-1 last:pb-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-[13px] text-[#0F172A]">
                        {proc.name}
                      </span>
                      <span className="ml-2 rounded-[4px] bg-[#F1F5F9] px-1.5 py-0.5 text-[11px] font-semibold text-[#64748B]">
                        {proc.code}
                      </span>
                    </div>
                    <div className="text-[12px] text-[#64748B] tabular-nums">
                      <span className="font-medium text-[#0F172A]">
                        {procEmployees.length} assigned
                      </span>
                      {" · "}
                      <span>{procBrands.length} brands</span>
                    </div>
                  </div>
                  <p className="mt-1 text-[12px] text-[#64748B]">
                    {proc.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Generated Roster Schedule Stream Preview */}
      <section className="rounded-[8px] border border-[#E2E8F0] bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] pb-3">
          <div>
            <h2 className="text-[16px] font-semibold text-[#0F172A]">
              Deterministic Shift Stream (Preview)
            </h2>
            <p className="text-[12px] text-[#64748B] tabular-nums">
              Showing first 12 of {entries.length} generated shifts for December 2026 operating days.
            </p>
          </div>
          <Link
            href="/roster"
            className="text-[13px] font-medium text-[#4F46E5] hover:underline"
          >
            Explore Full Matrix &rarr;
          </Link>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5">Operator</th>
                <th className="px-4 py-2.5">Brand</th>
                <th className="px-4 py-2.5">Pod</th>
                <th className="px-4 py-2.5">Process</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[13px] text-[#334155]">
              {entries.slice(0, 12).map((entry, idx) => (
                <tr
                  key={`${entry.workDate}-${entry.employeeId}-${idx}`}
                  className="h-[42px] hover:bg-[#F8FAFC] transition-colors"
                >
                  <td className="px-4 py-2 font-medium text-[#0F172A] tabular-nums">
                    {entry.workDate}
                  </td>
                  <td className="px-4 py-2">
                    {employeeNameById.get(entry.employeeId) ?? entry.employeeId}
                  </td>
                  <td className="px-4 py-2">
                    {brandNameById.get(entry.brandId) ?? entry.brandId}
                  </td>
                  <td className="px-4 py-2 text-[#64748B]">
                    {podNameById.get(entry.podId) ?? entry.podId}
                  </td>
                  <td className="px-4 py-2 text-[#64748B]">
                    {processNameById.get(entry.processId) ?? entry.processId}
                  </td>
                  <td className="px-4 py-2">
                    <span className="rounded-[4px] bg-[#ECFDF5] px-2 py-0.5 text-[11px] font-semibold text-[#10B981]">
                      SCHEDULED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
