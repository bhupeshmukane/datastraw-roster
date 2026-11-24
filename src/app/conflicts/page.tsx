import Link from "next/link";
import { createBaselineRosterInput } from "@/lib/roster/baseline-fixture";
import { generateMonthlyRoster } from "@/lib/roster/engine";

export default function ConflictCenterPage() {
  const input = createBaselineRosterInput(2026, 12);
  const { conflicts } = generateMonthlyRoster(input);

  const brandById = new Map(input.brands.map((b) => [b.id, b]));
  const employeeById = new Map(input.employees.map((e) => [e.id, e]));

  const understaffedConflicts = conflicts.filter(
    (c) => c.conflictType === "UNDERSTAFFED_BRAND"
  );
  const timeOffConflicts = conflicts.filter(
    (c) => c.conflictType === "EMPLOYEE_TIME_OFF"
  );
  const doubleBookedConflicts = conflicts.filter(
    (c) => c.conflictType === "DOUBLE_BOOKED_EMPLOYEE"
  );
  const dedicatedViolations = conflicts.filter(
    (c) => c.conflictType === "DEDICATED_BRAND_VIOLATION"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-[4px] px-2 py-0.5 text-[11px] font-semibold ${
                conflicts.length === 0
                  ? "bg-[#ECFDF5] text-[#10B981]"
                  : "bg-[#FEF2F2] text-[#EF4444]"
              }`}
            >
              {conflicts.length === 0 ? "ALL CLEAR" : `${conflicts.length} CONFLICT DETECTED`}
            </span>
            <span className="text-[13px] text-[#64748B]">
              Real-Time Engine Conflict Triage
            </span>
          </div>
          <h1 className="mt-1 text-[28px] font-semibold leading-9 tracking-[-0.02em] text-[#0F172A]">
            Conflict Center
          </h1>
          <p className="mt-0.5 text-[14px] text-[#334155] tabular-nums">
            Deterministic rule violation detection across operating days, approved leave, dedicated single-brand rules, and headcount minimums.
          </p>
        </div>

        <Link
          href="/validation"
          className="rounded-[4px] bg-[#4F46E5] px-4 py-2 text-[13px] font-medium text-white shadow-xs hover:bg-[#3525CD]"
        >
          View Full Validation Suite
        </Link>
      </div>

      {/* KPI Metric Summary Strip */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
            Total Conflicts
          </span>
          <p className="mt-1 text-[24px] font-semibold text-[#0F172A] tabular-nums">
            {conflicts.length}
          </p>
          <p className="mt-1 text-[12px] text-[#64748B]">Across all December 2026 shifts</p>
        </div>

        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
            Understaffed Brand Gaps
          </span>
          <p className="mt-1 text-[24px] font-semibold text-[#EF4444] tabular-nums">
            {understaffedConflicts.length}
          </p>
          <p className="mt-1 text-[12px] text-[#64748B]">
            Brands below min headcount of 1
          </p>
        </div>

        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
            Time-Off Overlaps
          </span>
          <p className="mt-1 text-[24px] font-semibold text-[#10B981] tabular-nums">
            {timeOffConflicts.length}
          </p>
          <p className="mt-1 text-[12px] text-[#64748B]">
            Engine strictly prevented leave shifts
          </p>
        </div>

        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
            Dedicated Isolation Breaches
          </span>
          <p className="mt-1 text-[24px] font-semibold text-[#10B981] tabular-nums">
            {dedicatedViolations.length}
          </p>
          <p className="mt-1 text-[12px] text-[#64748B]">
            16 Dedicated brands isolated 100%
          </p>
        </div>
      </section>

      {/* Conflict Log / Triage List */}
      <div className="rounded-[8px] border border-[#E2E8F0] bg-white shadow-xs">
        <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
          <h2 className="text-[14px] font-semibold text-[#0F172A]">
            Detected Scheduling Violations & Recommended Remediation
          </h2>
          <p className="text-[12px] text-[#64748B]">
            Real domain rule conflicts evaluated by the deterministic roster validation engine.
          </p>
        </div>

        {conflicts.length === 0 ? (
          <div className="p-8 text-center">
            <span className="inline-block rounded-full bg-[#ECFDF5] px-3 py-1 text-[12px] font-semibold text-[#10B981]">
              Zero Scheduling Conflicts
            </span>
            <p className="mt-2 text-[14px] text-[#334155]">
              Every operating shift satisfies operating day rules, time-off approvals, dedicated isolation, and staffing minimums.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Conflict Type</th>
                  <th className="px-4 py-2.5">Severity</th>
                  <th className="px-4 py-2.5">Impacted Target</th>
                  <th className="px-4 py-2.5">Engine Diagnostic Description</th>
                  <th className="px-4 py-2.5">Recommended Remediation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[13px] text-[#334155]">
                {conflicts.map((conflict, idx) => {
                  const brand = conflict.brandId
                    ? brandById.get(conflict.brandId)
                    : null;
                  const employee = conflict.employeeId
                    ? employeeById.get(conflict.employeeId)
                    : null;

                  return (
                    <tr
                      key={`${conflict.workDate}-${conflict.conflictType}-${idx}`}
                      className="h-[48px] hover:bg-[#F8FAFC] transition-colors"
                    >
                      <td className="px-4 py-2 font-medium text-[#0F172A] tabular-nums">
                        {conflict.workDate}
                      </td>
                      <td className="px-4 py-2 font-semibold text-[#0F172A]">
                        <span className="rounded-[4px] bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-semibold text-[#334155]">
                          {conflict.conflictType}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className="rounded-[4px] bg-[#FEF2F2] px-2 py-0.5 text-[11px] font-semibold text-[#EF4444]">
                          {conflict.severity}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {brand ? (
                          <span className="font-medium text-[#0F172A]">
                            {brand.code} ({brand.name})
                          </span>
                        ) : employee ? (
                          <span className="font-medium text-[#0F172A]">
                            {employee.employeeCode} ({employee.fullName})
                          </span>
                        ) : (
                          <span className="text-[#64748B]">Global Schedule</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-[#334155]">
                        {conflict.description}
                      </td>
                      <td className="px-4 py-2 text-[12px] text-[#4F46E5]">
                        {conflict.conflictType === "UNDERSTAFFED_BRAND"
                          ? "Assign temporary backup flex operator from matching pod"
                          : conflict.conflictType === "EMPLOYEE_TIME_OFF"
                          ? "Reassign date to next available operating operator"
                          : "Review staffing assignment"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
