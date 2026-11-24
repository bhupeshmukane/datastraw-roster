import Link from "next/link";
import { createBaselineRosterInput } from "@/lib/roster/baseline-fixture";
import { generateMonthlyRoster } from "@/lib/roster/engine";

export default function OperationsDashboardPage() {
  const input = createBaselineRosterInput(2026, 12);
  const { entries, conflicts } = generateMonthlyRoster(input);

  const dedicatedBrandsCount = input.brands.filter(
    (b) => b.staffingMode === "DEDICATED_SINGLE"
  ).length;
  const sharedBrandsCount = input.brands.filter(
    (b) => b.staffingMode === "SHARED_MULTI"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <h1 className="text-[28px] font-semibold leading-9 tracking-[-0.02em] text-[#0F172A]">
            Operations Dashboard
          </h1>
          <p className="mt-1 text-[14px] text-[#334155]">
            Live baseline summary for {input.year}-{String(input.month).padStart(2, "0")} across workforce, brands, pods, and processes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/roster"
            className="rounded-[4px] bg-[#4F46E5] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#3525CD]"
          >
            Open Monthly Roster
          </Link>
          <Link
            href="/validation"
            className="rounded-[4px] border border-[#E2E8F0] bg-white px-4 py-2 text-[13px] font-medium text-[#334155] transition hover:bg-[#F8FAFC]"
          >
            Run Validation
          </Link>
        </div>
      </div>

      <section aria-label="Key Operational Metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4">
          <p className="text-[12px] font-medium text-[#64748B]">Active Employees</p>
          <p className="mt-2 text-[28px] font-semibold leading-9 tracking-[-0.02em] text-[#0F172A] tabular-nums">
            {input.employees.length}
          </p>
          <span className="mt-2 inline-block rounded-[4px] bg-[#ECFDF5] px-2 py-0.5 text-[11px] font-semibold text-[#10B981]">
            {input.pods.length} Pods · {input.processes.length} Processes
          </span>
        </div>

        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4">
          <p className="text-[12px] font-medium text-[#64748B]">Managed D2C Brands</p>
          <p className="mt-2 text-[28px] font-semibold leading-9 tracking-[-0.02em] text-[#0F172A] tabular-nums">
            {input.brands.length}
          </p>
          <span className="mt-2 inline-block rounded-[4px] bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-semibold text-[#334155] tabular-nums">
            {dedicatedBrandsCount} Dedicated · {sharedBrandsCount} Shared
          </span>
        </div>

        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4">
          <p className="text-[12px] font-medium text-[#64748B]">Generated Shift Assignments</p>
          <p className="mt-2 text-[28px] font-semibold leading-9 tracking-[-0.02em] text-[#0F172A] tabular-nums">
            {entries.length}
          </p>
          <span className="mt-2 inline-block rounded-[4px] bg-[#ECFDF5] px-2 py-0.5 text-[11px] font-semibold text-[#10B981]">
            Deterministic Engine
          </span>
        </div>

        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-4">
          <p className="text-[12px] font-medium text-[#64748B]">Active Roster Conflicts</p>
          <p className="mt-2 text-[28px] font-semibold leading-9 tracking-[-0.02em] text-[#0F172A] tabular-nums">
            {conflicts.length}
          </p>
          <span
            className={`mt-2 inline-block rounded-[4px] px-2 py-0.5 text-[11px] font-semibold ${
              conflicts.length === 0
                ? "bg-[#ECFDF5] text-[#10B981]"
                : "bg-[#FEF2F2] text-[#EF4444]"
            }`}
          >
            {conflicts.length === 0 ? "Zero Violations" : "Action Required"}
          </span>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-5">
          <h2 className="text-[16px] font-semibold text-[#0F172A]">
            Operational Pods ({input.pods.length})
          </h2>
          <div className="mt-3 divide-y divide-[#E2E8F0] border-t border-[#E2E8F0]">
            {input.pods.map((pod) => (
              <div key={pod.id} className="flex items-center justify-between py-2.5 text-[13px]">
                <span className="font-medium text-[#0F172A]">{pod.name}</span>
                <span className="rounded-[4px] bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-semibold text-[#64748B] tabular-nums">
                  {pod.code}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-5">
          <h2 className="text-[16px] font-semibold text-[#0F172A]">
            Operational Processes ({input.processes.length})
          </h2>
          <div className="mt-3 divide-y divide-[#E2E8F0] border-t border-[#E2E8F0]">
            {input.processes.map((proc) => (
              <div key={proc.id} className="flex items-center justify-between py-2.5 text-[13px]">
                <span className="font-medium text-[#0F172A]">{proc.name}</span>
                <span className="rounded-[4px] bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-semibold text-[#64748B] tabular-nums">
                  {proc.code}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}