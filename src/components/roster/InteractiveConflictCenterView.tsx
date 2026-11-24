"use client";

import { useState } from "react";
import { useRosterWorkflow } from "./RosterWorkflowContext";
import { RosterToolbar } from "./RosterToolbar";
import { SupabaseStatusBanner } from "./SupabaseStatusBanner";
import { ManualEditModal } from "./ManualEditModal";

export function InteractiveConflictCenterView() {
  const { fixture, conflicts, resolveConflict } = useRosterWorkflow();

  const brandById = new Map(fixture.brands.map((b) => [b.id, b]));
  const employeeById = new Map(fixture.employees.map((e) => [e.id, e]));

  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [resolveTarget, setResolveTarget] = useState<{
    date: string;
    brandId?: string;
    employeeId?: string;
  } | null>(null);

  const understaffed = conflicts.filter((c) => c.conflictType === "UNDERSTAFFED_BRAND");
  const timeOffs = conflicts.filter((c) => c.conflictType === "EMPLOYEE_TIME_OFF");
  const dedicated = conflicts.filter((c) => c.conflictType === "DEDICATED_BRAND_VIOLATION");
  const doubleBooked = conflicts.filter((c) => c.conflictType === "DOUBLE_BOOKED_EMPLOYEE");

  const filteredConflicts = conflicts.filter((c) => {
    if (activeFilter === "ALL") return true;
    if (activeFilter === "UNDERSTAFFED") return c.conflictType === "UNDERSTAFFED_BRAND";
    if (activeFilter === "TIMEOFF") return c.conflictType === "EMPLOYEE_TIME_OFF";
    if (activeFilter === "DEDICATED") return c.conflictType === "DEDICATED_BRAND_VIOLATION";
    if (activeFilter === "DOUBLE") return c.conflictType === "DOUBLE_BOOKED_EMPLOYEE";
    return true;
  });

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
              {conflicts.length === 0
                ? "ZERO CONFLICTS"
                : `${conflicts.length} DETECTED VIOLATIONS`}
            </span>
            <span className="text-[13px] text-[#64748B]">
              Real-Time Deterministic Conflict Engine
            </span>
          </div>
          <h1 className="mt-1 text-[28px] font-semibold leading-9 tracking-[-0.02em] text-[#0F172A]">
            Conflict Center
          </h1>
          <p className="mt-0.5 text-[14px] text-[#334155]">
            Live diagnostic console monitoring time-offs, dedicated isolation, double assignments, and minimum headcount thresholds.
          </p>
        </div>
      </div>

      {/* Supabase Status Banner */}
      <SupabaseStatusBanner />

      {/* Roster Interactive Toolbar */}
      <RosterToolbar />

      {/* KPI Metric Summary Strip */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
            Total Conflicts
          </span>
          <p className="mt-1 text-[24px] font-semibold text-[#0F172A] tabular-nums">
            {conflicts.length}
          </p>
          <p className="mt-1 text-[12px] text-[#64748B]">Active operational flags</p>
        </div>

        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
            Understaffed Brands
          </span>
          <p className="mt-1 text-[24px] font-semibold text-[#EF4444] tabular-nums">
            {understaffed.length}
          </p>
          <p className="mt-1 text-[12px] text-[#64748B]">Below min headcount of 1</p>
        </div>

        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
            Time-Off Overlaps
          </span>
          <p className="mt-1 text-[24px] font-semibold text-[#F59E0B] tabular-nums">
            {timeOffs.length}
          </p>
          <p className="mt-1 text-[12px] text-[#64748B]">Approved PTO collisions</p>
        </div>

        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
            Dedicated Isolation
          </span>
          <p className="mt-1 text-[24px] font-semibold text-[#4F46E5] tabular-nums">
            {dedicated.length}
          </p>
          <p className="mt-1 text-[12px] text-[#64748B]">Cross-brand leakage</p>
        </div>

        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
            Double Bookings
          </span>
          <p className="mt-1 text-[24px] font-semibold text-[#0F172A] tabular-nums">
            {doubleBooked.length}
          </p>
          <p className="mt-1 text-[12px] text-[#64748B]">Same operator overlapping</p>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 rounded-[8px] border border-[#E2E8F0] bg-white p-2">
        <button
          type="button"
          onClick={() => setActiveFilter("ALL")}
          className={`rounded-[4px] px-3 py-1.5 text-[12px] font-medium transition ${
            activeFilter === "ALL"
              ? "bg-[#4F46E5] text-white"
              : "text-[#334155] hover:bg-[#F8FAFC]"
          }`}
        >
          All Conflicts ({conflicts.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("UNDERSTAFFED")}
          className={`rounded-[4px] px-3 py-1.5 text-[12px] font-medium transition ${
            activeFilter === "UNDERSTAFFED"
              ? "bg-[#4F46E5] text-white"
              : "text-[#334155] hover:bg-[#F8FAFC]"
          }`}
        >
          Understaffed ({understaffed.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("TIMEOFF")}
          className={`rounded-[4px] px-3 py-1.5 text-[12px] font-medium transition ${
            activeFilter === "TIMEOFF"
              ? "bg-[#4F46E5] text-white"
              : "text-[#334155] hover:bg-[#F8FAFC]"
          }`}
        >
          Time-Off Overlaps ({timeOffs.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("DEDICATED")}
          className={`rounded-[4px] px-3 py-1.5 text-[12px] font-medium transition ${
            activeFilter === "DEDICATED"
              ? "bg-[#4F46E5] text-white"
              : "text-[#334155] hover:bg-[#F8FAFC]"
          }`}
        >
          Dedicated Violations ({dedicated.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("DOUBLE")}
          className={`rounded-[4px] px-3 py-1.5 text-[12px] font-medium transition ${
            activeFilter === "DOUBLE"
              ? "bg-[#4F46E5] text-white"
              : "text-[#334155] hover:bg-[#F8FAFC]"
          }`}
        >
          Double Bookings ({doubleBooked.length})
        </button>
      </div>

      {/* Conflict Log / Triage List */}
      <div className="rounded-[8px] border border-[#E2E8F0] bg-white shadow-xs">
        <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
          <h2 className="text-[14px] font-semibold text-[#0F172A]">
            Detected Scheduling Violations & Interactive Remediation
          </h2>
          <p className="text-[12px] text-[#64748B]">
            Click &quot;Resolve via Edit&quot; to reassign shifts, or &quot;Mark Resolved&quot; to dismiss conflict with an audit note.
          </p>
        </div>

        {filteredConflicts.length === 0 ? (
          <div className="p-8 text-center">
            <span className="inline-block rounded-full bg-[#ECFDF5] px-3 py-1 text-[12px] font-semibold text-[#10B981]">
              Zero Matching Conflicts
            </span>
            <p className="mt-2 text-[14px] text-[#334155]">
              No scheduling violations detected under the current filter selection.
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
                  <th className="px-4 py-2.5">Target</th>
                  <th className="px-4 py-2.5">Description</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[13px] text-[#334155]">
                {filteredConflicts.map((conflict, idx) => {
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
                      <td className="px-4 py-2">
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
                      <td className="px-4 py-2 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              resolveConflict(
                                conflict.workDate,
                                conflict.conflictType,
                                "Acknowledged and resolved by operator in console",
                                conflict.employeeId ?? undefined,
                                conflict.brandId ?? undefined
                              )
                            }
                            className="rounded-[4px] border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 text-[11px] font-medium text-[#334155] transition hover:bg-[#F1F5F9]"
                          >
                            Mark Resolved
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setResolveTarget({
                                date: conflict.workDate,
                                brandId: conflict.brandId ?? undefined,
                                employeeId: conflict.employeeId ?? undefined,
                              })
                            }
                            className="rounded-[4px] border border-[#4F46E5] bg-[#EEF2FF] px-2.5 py-1 text-[11px] font-medium text-[#4F46E5] transition hover:bg-[#E0E7FF]"
                          >
                            Resolve via Edit &rarr;
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {resolveTarget && (
        <ManualEditModal
          isOpen={true}
          onClose={() => setResolveTarget(null)}
          initialDate={resolveTarget.date}
          initialBrandId={resolveTarget.brandId}
          initialEmployeeId={resolveTarget.employeeId}
        />
      )}
    </div>
  );
}
