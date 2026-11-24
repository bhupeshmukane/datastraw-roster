import Link from "next/link";
import { createBaselineRosterInput } from "@/lib/roster/baseline-fixture";
import {
  generateMonthlyRoster,
  getMonthDates,
  isOperatingDay,
} from "@/lib/roster/engine";

export default function MonthlyRosterPage() {
  const input = createBaselineRosterInput(2026, 12);
  const dates = getMonthDates(input.year, input.month);
  const { entries, conflicts } = generateMonthlyRoster(input);

  const operatingDates = dates.filter((d) =>
    isOperatingDay(d, input.calendar, input.calendarOverrides)
  );

  const employeeNameById = new Map(
    input.employees.map((e) => [e.id, e.fullName])
  );
  const employeeCodeById = new Map(
    input.employees.map((e) => [e.id, e.employeeCode])
  );
  const brandById = new Map(input.brands.map((b) => [b.id, b]));
  const podById = new Map(input.pods.map((p) => [p.id, p.code]));

  // Index entries by employeeId -> date -> entry
  const entryByEmpDate = new Map<string, string>();
  for (const entry of entries) {
    const brand = brandById.get(entry.brandId);
    entryByEmpDate.set(
      `${entry.employeeId}::${entry.workDate}`,
      brand ? brand.code : "ON"
    );
  }

  // Index time offs
  const timeOffByEmpDate = new Map<string, string>();
  for (const t of input.timeOffs) {
    timeOffByEmpDate.set(`${t.employeeId}::${t.timeOffDate}`, t.kind);
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-[4px] bg-[#EEF2FF] px-2 py-0.5 text-[11px] font-semibold text-[#4F46E5]">
              CYCLE 2026-12
            </span>
            <span className="text-[13px] text-[#64748B]">
              Standard Operating Mon–Sat Calendar
            </span>
          </div>
          <h1 className="mt-1 text-[28px] font-semibold leading-9 tracking-[-0.02em] text-[#0F172A]">
            Monthly Roster
          </h1>
          <p className="mt-0.5 text-[14px] text-[#334155]">
            High-density deterministic scheduling matrix for {input.employees.length} operators across {dates.length} calendar days.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/conflicts"
            className="rounded-[4px] border border-[#E2E8F0] bg-white px-3.5 py-2 text-[13px] font-medium text-[#334155] shadow-xs hover:bg-[#F8FAFC]"
          >
            Review Conflicts ({conflicts.length})
          </Link>
          <Link
            href="/validation"
            className="rounded-[4px] bg-[#4F46E5] px-4 py-2 text-[13px] font-medium text-white shadow-xs hover:bg-[#3525CD]"
          >
            Run Engine Validation
          </Link>
        </div>
      </div>

      {/* Operational Summary Strip */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
            Total Shifts Scheduled
          </span>
          <p className="mt-1 text-[24px] font-semibold text-[#0F172A] tabular-nums">
            {entries.length}
          </p>
          <p className="mt-1 text-[12px] text-[#64748B] tabular-nums">
            Across {operatingDates.length} operating dates
          </p>
        </div>

        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
            Calendar Days & Hours
          </span>
          <p className="mt-1 text-[24px] font-semibold text-[#0F172A] tabular-nums">
            {dates.length} Days
          </p>
          <p className="mt-1 text-[12px] text-[#64748B] tabular-nums">
            26 Mon-Sat shifts + 1 Holiday Closure
          </p>
        </div>

        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
            Approved Time-Offs
          </span>
          <p className="mt-1 text-[24px] font-semibold text-[#0F172A] tabular-nums">
            {input.timeOffs.length}
          </p>
          <p className="mt-1 text-[12px] text-[#64748B]">
            Leave & Comp-Off respects engine rules
          </p>
        </div>

        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
            Roster Health
          </span>
          <p className="mt-1 text-[24px] font-semibold text-[#10B981] tabular-nums">
            99.8% Met
          </p>
          <p className="mt-1 text-[12px] text-[#EF4444] tabular-nums">
            {conflicts.length} understaffed gap identified
          </p>
        </div>
      </section>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 rounded-[8px] border border-[#E2E8F0] bg-white px-4 py-3 text-[12px]">
        <span className="font-semibold text-[#0F172A]">Matrix Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-6 rounded-[2px] bg-[#EEF2FF] border border-[#C7D2FE] text-center text-[9px] font-bold text-[#4F46E5] leading-3">
            BR
          </span>
          <span className="text-[#334155]">Scheduled Brand Shift</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-6 rounded-[2px] bg-[#FFFBEB] border border-[#FDE68A] text-center text-[9px] font-bold text-[#B45309] leading-3">
            PTO
          </span>
          <span className="text-[#334155]">Approved Leave / Comp-Off</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-6 rounded-[2px] bg-[#F1F5F9] border border-[#E2E8F0] text-center text-[9px] font-bold text-[#64748B] leading-3">
            OFF
          </span>
          <span className="text-[#334155]">Non-Operating / Holiday</span>
        </div>
      </div>

      {/* High-Density Roster Matrix Table */}
      <div className="overflow-hidden rounded-[8px] border border-[#E2E8F0] bg-white shadow-xs">
        <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
          <h2 className="text-[14px] font-semibold text-[#0F172A]">
            Workforce Shift Allocation Matrix (December 1 – 31, 2026)
          </h2>
          <p className="text-[12px] text-[#64748B]">
            Horizontal scroll across all 31 days with sticky operator identification.
          </p>
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
                    input.calendar,
                    input.calendarOverrides
                  );
                  return (
                    <th
                      key={dateStr}
                      className={`min-w-[40px] px-1 py-1.5 text-center font-semibold tabular-nums ${
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
              {input.employees.map((emp) => {
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
                      const brandCode = entryByEmpDate.get(key);
                      const timeOff = timeOffByEmpDate.get(key);
                      const isOp = isOperatingDay(
                        dateStr,
                        input.calendar,
                        input.calendarOverrides
                      );

                      if (timeOff) {
                        return (
                          <td
                            key={dateStr}
                            className="bg-[#FFFBEB] p-0.5 text-center"
                            title={`Approved ${timeOff}`}
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
                            className="bg-[#F8FAFC] p-0.5 text-center text-[#94A3B8]"
                            title="Non-operating day"
                          >
                            <span className="text-[9px] text-[#94A3B8]">·</span>
                          </td>
                        );
                      }

                      if (brandCode) {
                        return (
                          <td
                            key={dateStr}
                            className="p-0.5 text-center"
                            title={`Assigned to ${brandCode}`}
                          >
                            <span className="inline-block rounded-[2px] bg-[#EEF2FF] px-1 py-0.5 text-[9px] font-semibold text-[#4F46E5] tabular-nums">
                              {brandCode.replace("BR-", "")}
                            </span>
                          </td>
                        );
                      }

                      return (
                        <td
                          key={dateStr}
                          className="p-0.5 text-center text-[#CBD5E1]"
                        >
                          -
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
    </div>
  );
}
