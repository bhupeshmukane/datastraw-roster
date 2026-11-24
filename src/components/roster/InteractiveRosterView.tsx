"use client";

import { useState } from "react";
import { useRosterWorkflow } from "./RosterWorkflowContext";
import { RosterToolbar } from "./RosterToolbar";
import { SupabaseStatusBanner } from "./SupabaseStatusBanner";
import { ManualEditModal } from "./ManualEditModal";
import { getMonthDates, isOperatingDay } from "@/lib/roster/engine";

export function InteractiveRosterView() {
  const {
    year,
    month,
    fixture,
    entries,
    conflicts,
    manualEdits,
  } = useRosterWorkflow();

  const dates = getMonthDates(year, month);
  const operatingDates = dates.filter((d) =>
    isOperatingDay(d, fixture.calendar, fixture.calendarOverrides)
  );

  const brandById = new Map(fixture.brands.map((b) => [b.id, b]));
  const podById = new Map(fixture.pods.map((p) => [p.id, p.code]));

  // Index entries by employeeId::date -> entry
  const entryByEmpDate = new Map<string, { brandCode: string; isManual: boolean; brandId: string }>();
  for (const entry of entries) {
    const brand = brandById.get(entry.brandId);
    entryByEmpDate.set(`${entry.employeeId}::${entry.workDate}`, {
      brandCode: brand ? brand.code : "ON",
      isManual: entry.source === "MANUAL_EDIT",
      brandId: entry.brandId,
    });
  }

  // Index time offs
  const timeOffByEmpDate = new Map<string, string>();
  for (const t of fixture.timeOffs) {
    timeOffByEmpDate.set(`${t.employeeId}::${t.timeOffDate}`, t.kind);
  }

  // State for manual edit modal clicked on cell
  const [editTarget, setEditTarget] = useState<{
    date: string;
    employeeId: string;
    brandId?: string;
  } | null>(null);

  const totalPossibleBrandShifts = operatingDates.length * fixture.brands.length;
  const coverageRate = (
    (entries.length / Math.max(totalPossibleBrandShifts, 1)) *
    100
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-[4px] bg-[#EEF2FF] px-2 py-0.5 text-[11px] font-semibold text-[#4F46E5]">
              INTERACTIVE ROSTER
            </span>
            <span className="text-[13px] text-[#64748B]">
              Cycle {year}-{String(month).padStart(2, "0")} · Deterministic Engine
            </span>
          </div>
          <h1 className="mt-1 text-[28px] font-semibold leading-9 tracking-[-0.02em] text-[#0F172A]">
            Monthly Roster
          </h1>
          <p className="mt-0.5 text-[14px] text-[#334155]">
            High-density scheduling matrix for {fixture.employees.length} operators across {dates.length} calendar days. Click any cell to manually edit or reassign.
          </p>
        </div>
      </div>

      {/* Supabase Status Banner */}
      <SupabaseStatusBanner />

      {/* Roster Interactive Toolbar */}
      <RosterToolbar />

      {/* Live Operational Metrics */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
            Scheduled Shifts
          </span>
          <p className="mt-1 text-[24px] font-semibold text-[#0F172A] tabular-nums">
            {entries.length}
          </p>
          <p className="mt-1 text-[12px] text-[#64748B] tabular-nums">
            {manualEdits.length} manual edits applied
          </p>
        </div>

        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
            Operating Schedule
          </span>
          <p className="mt-1 text-[24px] font-semibold text-[#0F172A] tabular-nums">
            {operatingDates.length} Days
          </p>
          <p className="mt-1 text-[12px] text-[#64748B]">
            {dates.length - operatingDates.length} off/holiday dates
          </p>
        </div>

        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
            Staffing Coverage
          </span>
          <p className="mt-1 text-[24px] font-semibold text-[#0F172A] tabular-nums">
            {coverageRate}%
          </p>
          <p className="mt-1 text-[12px] text-[#64748B]">
            Across 20 D2C brands
          </p>
        </div>

        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
            Roster Health
          </span>
          <p
            className={`mt-1 text-[24px] font-semibold tabular-nums ${
              conflicts.length === 0 ? "text-[#10B981]" : "text-[#EF4444]"
            }`}
          >
            {conflicts.length === 0 ? "0 Conflicts" : `${conflicts.length} Violations`}
          </p>
          <p className="mt-1 text-[12px] text-[#64748B]">
            Auto-revalidated after edits
          </p>
        </div>
      </section>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 rounded-[8px] border border-[#E2E8F0] bg-white px-4 py-3 text-[12px]">
        <span className="font-semibold text-[#0F172A]">Legend & Quick Actions:</span>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-6 rounded-[2px] bg-[#EEF2FF] border border-[#C7D2FE] text-center text-[9px] font-bold text-[#4F46E5] leading-3">
            BR
          </span>
          <span className="text-[#334155]">Generated Shift</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-6 rounded-[2px] bg-[#FAF5FF] border border-[#C084FC] text-center text-[9px] font-bold text-[#7E22CE] leading-3">
            MAN
          </span>
          <span className="text-[#334155]">Manual Edit</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-6 rounded-[2px] bg-[#FFFBEB] border border-[#FDE68A] text-center text-[9px] font-bold text-[#B45309] leading-3">
            PTO
          </span>
          <span className="text-[#334155]">Approved Leave</span>
        </div>
        <span className="ml-auto text-[11px] text-[#64748B]">
          Tip: Click any cell to open the manual assignment dialog
        </span>
      </div>

      {/* High-Density Roster Matrix Table */}
      <div className="overflow-hidden rounded-[8px] border border-[#E2E8F0] bg-white shadow-xs">
        <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
          <h2 className="text-[14px] font-semibold text-[#0F172A]">
            Interactive Workforce Matrix (Click cell to edit)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-[11px]">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <th className="sticky left-0 z-20 min-w-[180px] border-r border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 font-semibold text-[#0F172A]">
                  Operator & Pod
                </th>
                {dates.map((dateStr) => {
                  const dayNum = dateStr.slice(-2);
                  const isOp = isOperatingDay(
                    dateStr,
                    fixture.calendar,
                    fixture.calendarOverrides
                  );
                  return (
                    <th
                      key={dateStr}
                      className={`min-w-[42px] px-1 py-1.5 text-center font-semibold tabular-nums ${
                        isOp
                          ? "text-[#0F172A] bg-[#F8FAFC]"
                          : "text-[#94A3B8] bg-[#F1F5F9]"
                      }`}
                      title={dateStr}
                    >
                      <div>{dayNum}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {fixture.employees.map((emp) => {
                const podCode = podById.get(emp.podId) ?? "";
                return (
                  <tr key={emp.id} className="hover:bg-[#F8FAFC]">
                    <td className="sticky left-0 z-10 border-r border-[#E2E8F0] bg-white px-3 py-2 font-medium text-[#0F172A]">
                      <div className="truncate font-semibold">{emp.fullName}</div>
                      <div className="text-[10px] text-[#64748B] tabular-nums">
                        {emp.employeeCode} · {podCode}
                      </div>
                    </td>
                    {dates.map((dateStr) => {
                      const key = `${emp.id}::${dateStr}`;
                      const shiftData = entryByEmpDate.get(key);
                      const timeOff = timeOffByEmpDate.get(key);
                      const isOp = isOperatingDay(
                        dateStr,
                        fixture.calendar,
                        fixture.calendarOverrides
                      );

                      if (timeOff) {
                        return (
                          <td
                            key={dateStr}
                            onClick={() =>
                              setEditTarget({
                                date: dateStr,
                                employeeId: emp.id,
                              })
                            }
                            className="cursor-pointer bg-[#FFFBEB] p-0.5 text-center transition hover:ring-1 hover:ring-[#F59E0B]"
                            title={`Approved ${timeOff} — Click to override`}
                          >
                            <span className="inline-block rounded-[2px] bg-[#FEF3C7] px-1 py-0.5 text-[9px] font-bold text-[#B45309]">
                              PTO
                            </span>
                          </td>
                        );
                      }

                      if (!isOp) {
                        return (
                          <td
                            key={dateStr}
                            onClick={() =>
                              setEditTarget({
                                date: dateStr,
                                employeeId: emp.id,
                              })
                            }
                            className="cursor-pointer bg-[#F8FAFC] p-0.5 text-center text-[#94A3B8] transition hover:bg-[#F1F5F9]"
                            title="Non-operating day — Click to schedule"
                          >
                            <span className="text-[9px] text-[#94A3B8]">·</span>
                          </td>
                        );
                      }

                      if (shiftData) {
                        return (
                          <td
                            key={dateStr}
                            onClick={() =>
                              setEditTarget({
                                date: dateStr,
                                employeeId: emp.id,
                                brandId: shiftData.brandId,
                              })
                            }
                            className={`cursor-pointer p-0.5 text-center transition hover:ring-1 hover:ring-[#4F46E5] ${
                              shiftData.isManual ? "bg-[#FAF5FF]" : ""
                            }`}
                            title={`Assigned to ${shiftData.brandCode} (${
                              shiftData.isManual ? "MANUAL_EDIT" : "GENERATED"
                            }) — Click to edit`}
                          >
                            <span
                              className={`inline-block rounded-[2px] px-1 py-0.5 text-[9px] font-semibold tabular-nums ${
                                shiftData.isManual
                                  ? "bg-[#F3E8FF] text-[#7E22CE] border border-[#D8B4FE]"
                                  : "bg-[#EEF2FF] text-[#4F46E5]"
                              }`}
                            >
                              {shiftData.brandCode.replace("BR-", "")}
                            </span>
                          </td>
                        );
                      }

                      return (
                        <td
                          key={dateStr}
                          onClick={() =>
                            setEditTarget({
                              date: dateStr,
                              employeeId: emp.id,
                            })
                          }
                          className="cursor-pointer p-0.5 text-center text-[#CBD5E1] transition hover:bg-[#EEF2FF] hover:text-[#4F46E5]"
                          title="Unassigned — Click to assign shift"
                        >
                          +
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {editTarget && (
        <ManualEditModal
          isOpen={true}
          onClose={() => setEditTarget(null)}
          initialDate={editTarget.date}
          initialEmployeeId={editTarget.employeeId}
          initialBrandId={editTarget.brandId}
        />
      )}
    </div>
  );
}
