"use client";

import { useRosterWorkflow } from "./RosterWorkflowContext";
import { RosterToolbar } from "./RosterToolbar";
import { SupabaseStatusBanner } from "./SupabaseStatusBanner";
import { getMonthDates, isOperatingDay } from "@/lib/roster/engine";

export function InteractiveValidationView() {
  const {
    year,
    month,
    fixture,
    entries,
    conflicts,
    validationResult,
    runValidation,
    isRevalidating,
  } = useRosterWorkflow();

  const dates = getMonthDates(year, month);
  const operatingDates = dates.filter((d) =>
    isOperatingDay(d, fixture.calendar, fixture.calendarOverrides)
  );

  const totalOperatingSlots = operatingDates.length * fixture.brands.length;

  const understaffedConflicts = conflicts.filter(
    (c) => c.conflictType === "UNDERSTAFFED_BRAND"
  );
  const timeOffConflicts = conflicts.filter(
    (c) => c.conflictType === "EMPLOYEE_TIME_OFF"
  );
  const doubleBookedConflicts = conflicts.filter(
    (c) => c.conflictType === "DOUBLE_BOOKED_EMPLOYEE"
  );
  const dedicatedBrandConflicts = conflicts.filter(
    (c) => c.conflictType === "DEDICATED_BRAND_VIOLATION"
  );
  const calendarConflicts = conflicts.filter(
    (c) => c.conflictType === "NON_OPERATING_DAY"
  );

  const compliantSlots = Math.max(
    0,
    totalOperatingSlots - conflicts.length
  );
  const compliancePercentage = (
    (compliantSlots / Math.max(totalOperatingSlots, 1)) *
    100
  ).toFixed(1);

  const CHECKLIST_ITEMS = [
    {
      category: "Calendar & Operating Rules",
      rule: "Operating Days Calendar Compliance",
      scope: `${dates.length} Days in Cycle`,
      description:
        "All shifts must occur on operating days (Mon–Sat) and adhere to holiday overrides.",
      violationsCount: calendarConflicts.length,
      passed: calendarConflicts.length === 0,
    },
    {
      category: "Calendar & Operating Rules",
      rule: "Holiday Override Verification (Christmas Dec 25)",
      scope: "1 Calendar Override Date",
      description:
        "No shifts scheduled on the scheduled holiday closure date (2026-12-25).",
      violationsCount: entries.filter((e) => e.workDate === `${year}-${String(month).padStart(2, "0")}-25`).length,
      passed: entries.filter((e) => e.workDate === `${year}-${String(month).padStart(2, "0")}-25`).length === 0,
    },
    {
      category: "Workforce & Availability",
      rule: "Approved Time-Off / PTO Protection",
      scope: `${fixture.timeOffs.length} Approved Requests`,
      description:
        "Operators with approved LEAVE or COMP_OFF must not be assigned shifts on their off dates.",
      violationsCount: timeOffConflicts.length,
      passed: timeOffConflicts.length === 0,
    },
    {
      category: "Workforce & Availability",
      rule: "No Double-Booking Overlaps",
      scope: `${fixture.employees.length} Operators × ${dates.length} Days`,
      description:
        "No operator may hold more than one shift assignment on the same work date.",
      violationsCount: doubleBookedConflicts.length,
      passed: doubleBookedConflicts.length === 0,
    },
    {
      category: "Staffing Governance",
      rule: "Dedicated Single-Owner Brand Isolation",
      scope: "16 Dedicated Brands (80%)",
      description:
        "Operators assigned to DEDICATED_SINGLE brands must not be scheduled to any other brand.",
      violationsCount: dedicatedBrandConflicts.length,
      passed: dedicatedBrandConflicts.length === 0,
    },
    {
      category: "Staffing Governance",
      rule: "Minimum Headcount Staffing Rule",
      scope: `${fixture.brands.length} Brands × ${operatingDates.length} Operating Days`,
      description:
        "Every active brand must maintain at least 1 scheduled operator per operating day.",
      violationsCount: understaffedConflicts.length,
      passed: understaffedConflicts.length === 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-[4px] px-2 py-0.5 text-[11px] font-semibold ${
                validationResult.valid
                  ? "bg-[#ECFDF5] text-[#10B981]"
                  : "bg-[#FFFBEB] text-[#B45309]"
              }`}
            >
              {validationResult.valid
                ? "SUITE PASSED (0 ERRORS)"
                : "AUDIT ACTIVE"}
            </span>
            <span className="text-[13px] text-[#64748B]">
              Real-Time Rule Validation Suite
            </span>
          </div>
          <h1 className="mt-1 text-[28px] font-semibold leading-9 tracking-[-0.02em] text-[#0F172A]">
            Roster Validation
          </h1>
          <p className="mt-0.5 text-[14px] text-[#334155]">
            Comprehensive deterministic compliance audit across operating calendars, approved time-offs, dedicated isolation, and staffing minimums.
          </p>
        </div>
      </div>

      {/* Supabase Status Banner */}
      <SupabaseStatusBanner />

      {/* Roster Interactive Toolbar */}
      <RosterToolbar />

      {/* KPI Summary Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
            Validation Status
          </span>
          <p
            className={`mt-1 text-[24px] font-semibold tabular-nums ${
              validationResult.valid ? "text-[#10B981]" : "text-[#B45309]"
            }`}
          >
            {validationResult.valid ? "PASSED" : "ATTENTION"}
          </p>
          <p className="mt-1 text-[12px] text-[#64748B]">
            {conflicts.length === 0
              ? "All rules satisfied"
              : `${conflicts.length} rule violation${conflicts.length === 1 ? "" : "s"} detected`}
          </p>
        </div>

        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
            Compliance Score
          </span>
          <p className="mt-1 text-[24px] font-semibold text-[#0F172A] tabular-nums">
            {compliancePercentage}%
          </p>
          <p className="mt-1 text-[12px] text-[#64748B] tabular-nums">
            {compliantSlots} / {totalOperatingSlots} compliant slots
          </p>
        </div>

        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
            Rules Evaluated
          </span>
          <p className="mt-1 text-[24px] font-semibold text-[#0F172A] tabular-nums">
            {CHECKLIST_ITEMS.length} Rules
          </p>
          <p className="mt-1 text-[12px] text-[#64748B] tabular-nums">
            {CHECKLIST_ITEMS.filter((i) => i.passed).length} Passed ·{" "}
            {CHECKLIST_ITEMS.filter((i) => !i.passed).length} Flagged
          </p>
        </div>

        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
            Dedicated Isolation
          </span>
          <p
            className={`mt-1 text-[24px] font-semibold tabular-nums ${
              dedicatedBrandConflicts.length === 0
                ? "text-[#10B981]"
                : "text-[#EF4444]"
            }`}
          >
            {dedicatedBrandConflicts.length === 0
              ? "100%"
              : `${dedicatedBrandConflicts.length} Leaks`}
          </p>
          <p className="mt-1 text-[12px] text-[#64748B]">
            16 Dedicated brands isolated
          </p>
        </div>
      </section>

      {/* Detailed Validation Rule Checklist */}
      <div className="rounded-[8px] border border-[#E2E8F0] bg-white shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
          <div>
            <h2 className="text-[14px] font-semibold text-[#0F172A]">
              Audit Checklist & Rule Verification Matrix
            </h2>
            <p className="text-[12px] text-[#64748B]">
              Real-time audit results automatically revalidated upon manual edits.
            </p>
          </div>
          <button
            type="button"
            onClick={runValidation}
            disabled={isRevalidating}
            className="rounded-[4px] border border-[#E2E8F0] bg-white px-3 py-1 text-[12px] font-medium text-[#334155] transition hover:bg-[#F8FAFC]"
          >
            {isRevalidating ? "Running Audit..." : "Re-Run Audit"}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
                <th className="px-4 py-2.5">Category</th>
                <th className="px-4 py-2.5">Validation Rule</th>
                <th className="px-4 py-2.5">Audit Scope</th>
                <th className="px-4 py-2.5">Rule Requirement</th>
                <th className="px-4 py-2.5">Violations</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[13px] text-[#334155]">
              {CHECKLIST_ITEMS.map((item, idx) => (
                <tr
                  key={`${item.rule}-${idx}`}
                  className="h-[46px] hover:bg-[#F8FAFC] transition-colors"
                >
                  <td className="px-4 py-2 text-[12px] font-medium text-[#64748B]">
                    {item.category}
                  </td>
                  <td className="px-4 py-2 font-medium text-[#0F172A]">
                    {item.rule}
                  </td>
                  <td className="px-4 py-2 text-[12px] tabular-nums text-[#64748B]">
                    {item.scope}
                  </td>
                  <td className="px-4 py-2 text-[12px] text-[#334155]">
                    {item.description}
                  </td>
                  <td className="px-4 py-2 font-medium tabular-nums">
                    {item.violationsCount === 0 ? (
                      <span className="text-[#10B981]">0</span>
                    ) : (
                      <span className="text-[#EF4444]">
                        {item.violationsCount}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {item.passed ? (
                      <span className="rounded-[4px] bg-[#ECFDF5] px-2 py-0.5 text-[11px] font-semibold text-[#10B981]">
                        PASSED
                      </span>
                    ) : (
                      <span className="rounded-[4px] bg-[#FEF2F2] px-2 py-0.5 text-[11px] font-semibold text-[#EF4444]">
                        FLAGGED
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
