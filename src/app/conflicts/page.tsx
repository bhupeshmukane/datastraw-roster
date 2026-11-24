import { createBaselineRosterInput } from "@/lib/roster/baseline-fixture";
import { generateMonthlyRoster } from "@/lib/roster/engine";

export default function ConflictCenterPage() {
  const input = createBaselineRosterInput(2026, 12);
  const { conflicts } = generateMonthlyRoster(input);

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E2E8F0] pb-4">
        <h1 className="text-[28px] font-semibold leading-9 tracking-[-0.02em] text-[#0F172A]">
          Conflict Center
        </h1>
        <p className="mt-1 text-[14px] text-[#334155] tabular-nums">
          {conflicts.length} detected scheduling conflicts across time-offs, operating calendars, dedicated brand rules, and headcount minimums.
        </p>
      </div>

      {conflicts.length === 0 ? (
        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-6">
          <span className="inline-block rounded-[4px] bg-[#ECFDF5] px-2.5 py-1 text-[11px] font-semibold text-[#10B981]">
            CLEAR
          </span>
          <p className="mt-2 text-[14px] font-medium text-[#0F172A]">
            No active conflicts detected on the baseline generated schedule.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[8px] border border-[#E2E8F0] bg-white">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-semibold uppercase tracking-[0.02em] text-[#64748B]">
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5">Type</th>
                <th className="px-4 py-2.5">Severity</th>
                <th className="px-4 py-2.5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[13px] text-[#334155]">
              {conflicts.map((conflict, idx) => (
                <tr key={`${conflict.workDate}-${conflict.conflictType}-${idx}`} className="h-[42px] hover:bg-[#F8FAFC]">
                  <td className="px-4 py-2 font-medium text-[#0F172A] tabular-nums">
                    {conflict.workDate}
                  </td>
                  <td className="px-4 py-2">{conflict.conflictType}</td>
                  <td className="px-4 py-2">
                    <span className="rounded-[4px] bg-[#FEF2F2] px-2 py-0.5 text-[11px] font-semibold text-[#EF4444]">
                      {conflict.severity}
                    </span>
                  </td>
                  <td className="px-4 py-2">{conflict.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}