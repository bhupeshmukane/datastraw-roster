import { createBaselineRosterInput } from "@/lib/roster/baseline-fixture";

export default function EmployeeManagementPage() {
  const input = createBaselineRosterInput(2026, 12);
  const podById = new Map(input.pods.map((p) => [p.id, p.name]));
  const processById = new Map(input.processes.map((p) => [p.id, p.name]));

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E2E8F0] pb-4">
        <h1 className="text-[28px] font-semibold leading-9 tracking-[-0.02em] text-[#0F172A]">
          Employee Management
        </h1>
        <p className="mt-1 text-[14px] text-[#334155] tabular-nums">
          {input.employees.length} active operators mapped across {input.pods.length} pods and {input.processes.length} operational processes.
        </p>
      </div>

      <div className="overflow-x-auto rounded-[8px] border border-[#E2E8F0] bg-white">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-semibold uppercase tracking-[0.02em] text-[#64748B]">
              <th className="px-4 py-2.5">Code</th>
              <th className="px-4 py-2.5">Employee</th>
              <th className="px-4 py-2.5">Pod</th>
              <th className="px-4 py-2.5">Primary Process</th>
              <th className="px-4 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] text-[13px] text-[#334155]">
            {input.employees.map((emp) => (
              <tr key={emp.id} className="h-[42px] hover:bg-[#F8FAFC]">
                <td className="px-4 py-2 font-medium text-[#0F172A] tabular-nums">
                  {emp.employeeCode}
                </td>
                <td className="px-4 py-2">{emp.fullName}</td>
                <td className="px-4 py-2">{podById.get(emp.podId) ?? emp.podId}</td>
                <td className="px-4 py-2">
                  {processById.get(emp.primaryProcessId) ?? emp.primaryProcessId}
                </td>
                <td className="px-4 py-2">
                  <span className="rounded-[4px] bg-[#ECFDF5] px-2 py-0.5 text-[11px] font-semibold text-[#10B981]">
                    {emp.isActive ? "ACTIVE" : "INACTIVE"}
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