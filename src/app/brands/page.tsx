import { createBaselineRosterInput } from "@/lib/roster/baseline-fixture";

export default function BrandManagementPage() {
  const input = createBaselineRosterInput(2026, 12);
  const dedicatedCount = input.brands.filter(
    (b) => b.staffingMode === "DEDICATED_SINGLE"
  ).length;
  const sharedCount = input.brands.filter(
    (b) => b.staffingMode === "SHARED_MULTI"
  ).length;

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E2E8F0] pb-4">
        <h1 className="text-[28px] font-semibold leading-9 tracking-[-0.02em] text-[#0F172A]">
          Brand Management
        </h1>
        <p className="mt-1 text-[14px] text-[#334155] tabular-nums">
          {input.brands.length} D2C brands configured: {dedicatedCount} dedicated single-owner (80%) and {sharedCount} multi-employee shared (20%).
        </p>
      </div>

      <div className="overflow-x-auto rounded-[8px] border border-[#E2E8F0] bg-white">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-semibold uppercase tracking-[0.02em] text-[#64748B]">
              <th className="px-4 py-2.5">Code</th>
              <th className="px-4 py-2.5">Brand</th>
              <th className="px-4 py-2.5">Staffing Model</th>
              <th className="px-4 py-2.5">Assigned Staff</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] text-[13px] text-[#334155]">
            {input.brands.map((brand) => {
              const assignedCount = input.assignments.filter(
                (a) => a.brandId === brand.id
              ).length;
              const isDedicated = brand.staffingMode === "DEDICATED_SINGLE";

              return (
                <tr key={brand.id} className="h-[42px] hover:bg-[#F8FAFC]">
                  <td className="px-4 py-2 font-medium text-[#0F172A] tabular-nums">
                    {brand.code}
                  </td>
                  <td className="px-4 py-2">{brand.name}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-[4px] px-2 py-0.5 text-[11px] font-semibold ${
                        isDedicated
                          ? "bg-[#EEF2FF] text-[#4F46E5]"
                          : "bg-[#FFFBEB] text-[#F59E0B]"
                      }`}
                    >
                      {brand.staffingMode}
                    </span>
                  </td>
                  <td className="px-4 py-2 tabular-nums">{assignedCount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}