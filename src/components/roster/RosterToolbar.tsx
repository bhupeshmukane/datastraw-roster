"use client";

import { useState } from "react";
import { useRosterWorkflow } from "./RosterWorkflowContext";
import { ManualEditModal } from "./ManualEditModal";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function RosterToolbar() {
  const {
    year,
    month,
    changeCycle,
    regenerateRoster,
    runValidation,
    isRevalidating,
    manualEdits,
    conflicts,
    persistCurrentRoster,
    isPersisting,
  } = useRosterWorkflow();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-[#E2E8F0] bg-white p-3 shadow-xs">
        {/* Cycle Selection Controls */}
        <div className="flex items-center gap-2">
          <label htmlFor="cycle-year-select" className="text-[12px] font-semibold text-[#64748B] uppercase tracking-wider">
            Cycle:
          </label>
          <select
            id="cycle-year-select"
            aria-label="Select cycle year"
            value={year}
            onChange={(e) => changeCycle(Number(e.target.value), month)}
            className="rounded-[4px] border border-[#E2E8F0] bg-white px-2.5 py-1 text-[13px] font-medium text-[#0F172A] tabular-nums focus:border-[#4F46E5] focus:outline-hidden"
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>

          <select
            aria-label="Select cycle month"
            value={month}
            onChange={(e) => changeCycle(year, Number(e.target.value))}
            className="rounded-[4px] border border-[#E2E8F0] bg-white px-2.5 py-1 text-[13px] font-medium text-[#0F172A] focus:border-[#4F46E5] focus:outline-hidden"
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={name} value={idx + 1}>
                {name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={regenerateRoster}
            title="Reset manual overrides and re-run deterministic generation"
            className="rounded-[4px] border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1 text-[12px] font-medium text-[#334155] transition hover:bg-[#F1F5F9]"
          >
            Regenerate Roster
          </button>
        </div>

        {/* Action Controls & Manual Edit Trigger */}
        <div className="flex items-center gap-2">
          {manualEdits.length > 0 && (
            <span className="rounded-[4px] bg-[#EEF2FF] px-2 py-1 text-[11px] font-semibold text-[#4F46E5] tabular-nums">
              {manualEdits.length} Manual Edit{manualEdits.length > 1 ? "s" : ""}
            </span>
          )}

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="rounded-[4px] border border-[#4F46E5]/30 bg-[#EEF2FF] px-3 py-1 text-[12px] font-medium text-[#4F46E5] transition hover:bg-[#E0E7FF]"
          >
            + Manual Edit
          </button>

          <button
            type="button"
            onClick={runValidation}
            disabled={isRevalidating}
            className={`rounded-[4px] border px-3 py-1 text-[12px] font-medium transition ${
              conflicts.length === 0
                ? "border-[#A7F3D0] bg-[#ECFDF5] text-[#065F46] hover:bg-[#D1FAE5]"
                : "border-[#FECACA] bg-[#FEF2F2] text-[#991B1B] hover:bg-[#FEE2E2]"
            }`}
          >
            {isRevalidating
              ? "Revalidating..."
              : `Validate (${conflicts.length} Conflict${conflicts.length === 1 ? "" : "s"})`}
          </button>

          <button
            type="button"
            onClick={() => persistCurrentRoster()}
            disabled={isPersisting}
            className="rounded-[4px] bg-[#0F172A] px-3 py-1 text-[12px] font-medium text-white shadow-xs transition hover:bg-[#1E293B] disabled:opacity-50"
          >
            {isPersisting ? "Saving..." : "Save to DB"}
          </button>
        </div>
      </div>

      <ManualEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </>
  );
}
