import { createBaselineRosterInput } from "@/lib/roster/baseline-fixture";
import { generateMonthlyRoster, validateRosterEntries } from "@/lib/roster/engine";

export default function RosterValidationPage() {
  const input = createBaselineRosterInput(2026, 12);
  const { entries } = generateMonthlyRoster(input);
  const result = validateRosterEntries({ ...input, entries });

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E2E8F0] pb-4">
        <h1 className="text-[28px] font-semibold leading-9 tracking-[-0.02em] text-[#0F172A]">
          Roster Validation
        </h1>
        <p className="mt-1 text-[14px] text-[#334155]">
          Deterministic rule verification across operating days, approved time-offs, dedicated brand isolation, and headcount minimums.
        </p>
      </div>

      <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[12px] font-medium text-[#64748B]">Validation Status</p>
            <p className="mt-1 text-[20px] font-semibold text-[#0F172A] tabular-nums">
              {result.valid ? "PASSED — 0 Rule Violations" : `FAILED — ${result.conflicts.length} Rule Violations`}
            </p>
          </div>
          <span
            className={`rounded-[4px] px-3 py-1 text-[11px] font-semibold ${
              result.valid
                ? "bg-[#ECFDF5] text-[#10B981]"
                : "bg-[#FEF2F2] text-[#EF4444]"
            }`}
          >
            {result.valid ? "VALID" : "INVALID"}
          </span>
        </div>
      </div>
    </div>
  );
}