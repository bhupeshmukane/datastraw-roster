"use client";

import { useState } from "react";
import { useRosterWorkflow } from "./RosterWorkflowContext";
import { getMonthDates, isOperatingDay } from "@/lib/roster/engine";

export interface ManualEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
  initialEmployeeId?: string;
  initialBrandId?: string;
}

export function ManualEditModal({
  isOpen,
  onClose,
  initialDate,
  initialEmployeeId,
  initialBrandId,
}: ManualEditModalProps) {
  const {
    year,
    month,
    fixture,
    entries,
    updateOrAddAssignment,
    removeAssignment,
  } = useRosterWorkflow();

  const dates = getMonthDates(year, month);
  const defaultDate = initialDate ?? dates[0];
  const defaultBrandId = initialBrandId ?? fixture.brands[0].id;
  const defaultEmpId = initialEmployeeId ?? fixture.employees[0].id;

  const [selectedDate, setSelectedDate] = useState<string>(defaultDate);
  const [selectedBrandId, setSelectedBrandId] = useState<string>(defaultBrandId);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(defaultEmpId);

  if (!isOpen) return null;

  const isOperating = isOperatingDay(
    selectedDate,
    fixture.calendar,
    fixture.calendarOverrides
  );

  const selectedBrand = fixture.brands.find((b) => b.id === selectedBrandId);
  const selectedEmp = fixture.employees.find((e) => e.id === selectedEmployeeId);

  // Check for time off on selected date
  const isEmpOnTimeOff = fixture.timeOffs.some(
    (t) =>
      t.employeeId === selectedEmployeeId &&
      t.timeOffDate === selectedDate &&
      t.status === "APPROVED"
  );

  // Check if dedicated brand mismatch
  const primaryAssignment = fixture.assignments.find(
    (a) => a.brandId === selectedBrandId && a.isPrimary
  );
  const isDedicated = selectedBrand?.staffingMode === "DEDICATED_SINGLE";
  const isDedicatedMismatch =
    isDedicated &&
    primaryAssignment &&
    primaryAssignment.employeeId !== selectedEmployeeId;

  // Check if employee is already scheduled on this date
  const existingShiftOnDate = entries.find(
    (e) => e.workDate === selectedDate && e.employeeId === selectedEmployeeId
  );
  const isAlreadyAssigned =
    existingShiftOnDate && existingShiftOnDate.brandId !== selectedBrandId;

  // Check if this exact shift exists
  const exactShiftExists = entries.some(
    (e) =>
      e.workDate === selectedDate &&
      e.employeeId === selectedEmployeeId &&
      e.brandId === selectedBrandId
  );

  const handleApply = () => {
    updateOrAddAssignment(selectedDate, selectedEmployeeId, selectedBrandId);
    onClose();
  };

  const handleRemove = () => {
    removeAssignment(selectedDate, selectedEmployeeId, selectedBrandId);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="manual-edit-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
    >
      <div className="w-full max-w-lg rounded-[8px] border border-[#E2E8F0] bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div>
            <h2 id="manual-edit-title" className="text-[18px] font-semibold text-[#0F172A]">
              Manual Roster Edit
            </h2>
            <p className="text-[12px] text-[#64748B]">
              Deterministic edit tagged with source: &quot;MANUAL_EDIT&quot;
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[4px] p-1 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-4 text-[13px]">
          {/* Work Date Selection */}
          <div>
            <label htmlFor="edit-work-date" className="block font-medium text-[#0F172A]">
              Work Date
            </label>
            <select
              id="edit-work-date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-1 w-full rounded-[4px] border border-[#E2E8F0] bg-white px-3 py-2 text-[13px] text-[#0F172A] tabular-nums focus:border-[#4F46E5] focus:outline-hidden"
            >
              {dates.map((d) => (
                <option key={d} value={d}>
                  {d} {isOperatingDay(d, fixture.calendar, fixture.calendarOverrides) ? "" : "(Non-Operating)"}
                </option>
              ))}
            </select>
            {!isOperating && (
              <p className="mt-1 text-[11px] font-medium text-[#B45309]">
                Notice: {selectedDate} is a non-operating calendar day. Scheduling here triggers NON_OPERATING_DAY conflict.
              </p>
            )}
          </div>

          {/* Brand Selection */}
          <div>
            <label htmlFor="edit-brand" className="block font-medium text-[#0F172A]">
              Target Brand
            </label>
            <select
              id="edit-brand"
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
              className="mt-1 w-full rounded-[4px] border border-[#E2E8F0] bg-white px-3 py-2 text-[13px] text-[#0F172A] focus:border-[#4F46E5] focus:outline-hidden"
            >
              {fixture.brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.code} · {b.name} ({b.staffingMode})
                </option>
              ))}
            </select>
          </div>

          {/* Operator Selection */}
          <div>
            <label htmlFor="edit-operator" className="block font-medium text-[#0F172A]">
              Assigned Operator
            </label>
            <select
              id="edit-operator"
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="mt-1 w-full rounded-[4px] border border-[#E2E8F0] bg-white px-3 py-2 text-[13px] text-[#0F172A] focus:border-[#4F46E5] focus:outline-hidden"
            >
              {fixture.employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.employeeCode} · {emp.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Real-time Constraint Warnings */}
          <div className="space-y-1.5 rounded-[4px] bg-[#F8FAFC] p-3 text-[12px] border border-[#E2E8F0]">
            <p className="font-semibold text-[#0F172A]">Engine Pre-Check:</p>
            {isEmpOnTimeOff && (
              <p className="text-[#EF4444] font-medium">
                • {selectedEmp?.fullName} has approved leave on {selectedDate}. Applying this will trigger an EMPLOYEE_TIME_OFF conflict.
              </p>
            )}
            {isDedicatedMismatch && (
              <p className="text-[#EF4444] font-medium">
                • {selectedBrand?.name} is DEDICATED_SINGLE. Assigning a non-primary operator will trigger a DEDICATED_BRAND_VIOLATION conflict.
              </p>
            )}
            {isAlreadyAssigned && (
              <p className="text-[#B45309] font-medium">
                • {selectedEmp?.fullName} is already assigned to {existingShiftOnDate.brandId} on {selectedDate}. Applying will create a DOUBLE_BOOKED_EMPLOYEE conflict.
              </p>
            )}
            {!isEmpOnTimeOff && !isDedicatedMismatch && !isAlreadyAssigned && isOperating && (
              <p className="text-[#10B981] font-medium">
                • All rules clear. Deterministic engine will validate shift smoothly.
              </p>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex items-center justify-between gap-3 border-t border-[#E2E8F0] pt-4">
          <div>
            {exactShiftExists && (
              <button
                type="button"
                onClick={handleRemove}
                className="rounded-[4px] border border-[#FECACA] bg-[#FEF2F2] px-3 py-1.5 text-[12px] font-medium text-[#EF4444] transition hover:bg-[#FEE2E2]"
              >
                Remove Assignment
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-[4px] border border-[#E2E8F0] bg-white px-3.5 py-1.5 text-[12px] font-medium text-[#334155] transition hover:bg-[#F8FAFC]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="rounded-[4px] bg-[#4F46E5] px-4 py-1.5 text-[12px] font-medium text-white transition hover:bg-[#3525CD]"
            >
              Apply Manual Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
