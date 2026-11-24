import { createBaselineRosterInput } from "@/lib/roster/baseline-fixture";
import { generateMonthlyRoster, getMonthDates } from "@/lib/roster/engine";

export default function MonthlyRosterPage() {
  const input = createBaselineRosterInput(2026, 12);
  const dates = getMonthDates(input.year, input.month);
  const { entries, conflicts } = generateMonthlyRoster(input);

  const employeeNameById = new Map(
    input.employees.map((e) => [e.id, `${e.employeeCode} · ${e.fullName}`])
  );
  const brandNameById = new Map(
    input.brands.map((b) => [b.id, `${b.code} · ${b.name}`])
  );

  const previewEntries = entries.slice(0, 30);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <h1 className="text-[28px] font-semibold leading-9 tracking-[-0.02em] text-[#0F172A]">
            Monthly Roster
          </h1>
          <p className="mt-1 text-[14px] text-[#334155] tabular-nums">
            Schedule cycle {input.year}-{String(input.month).padStart(2, "0")} ({dates.length} calendar days · {entries.length} total assignments · {conflicts.length} conflicts).
          </p>
        </div>
        <span className="rounded-[4px] bg-[#F1F5F9] px-3 py-1.5 text-[12px] font-medium text-[#334155]">
          {input.calendar.name}
        </span>
      </div>

      <div className="overflow-x-auto rounded-[8px] border border-[#E2E8F0] bg-white">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-semibold uppercase tracking-[0.02em] text-[#64748B]">
              <th className="px-4 py-2.5">Date</th>
              <th className="px-4 py-2.5">Employee</th>
              <th className="px-4 py-2.5">Brand</th>
              <th className="px-4 py-2.5">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] text-[13px] text-[#334155]">
            {previewEntries.map((entry, idx) => (
              <tr key={`${entry.workDate}-${entry.employeeId}-${entry.brandId}-${idx}`} className="h-[42px] hover:bg-[#F8FAFC]">
                <td className="px-4 py-2 font-medium text-[#0F172A] tabular-nums">
                  {entry.workDate}
                </td>
                <td className="px-4 py-2">
                  {employeeNameById.get(entry.employeeId) ?? entry.employeeId}
                </td>
                <td className="px-4 py-2">
                  {brandNameById.get(entry.brandId) ?? entry.brandId}
                </td>
                <td className="px-4 py-2">
                  <span className="rounded-[4px] bg-[#ECFDF5] px-2 py-0.5 text-[11px] font-semibold text-[#10B981]">
                    {entry.source}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}