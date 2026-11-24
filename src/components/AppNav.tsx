"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Operations Dashboard", code: "01" },
  { href: "/roster", label: "Monthly Roster", code: "02" },
  { href: "/employees", label: "Employee Management", code: "03" },
  { href: "/brands", label: "Brand Management", code: "04" },
  { href: "/conflicts", label: "Conflict Center", code: "05" },
  { href: "/validation", label: "Roster Validation", code: "06" },
] as const;

export function AppNav() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-[#E2E8F0] bg-white lg:border-b-0 lg:border-r">
      <div className="flex flex-col justify-between p-4 lg:sticky lg:top-0 lg:h-screen lg:p-5">
        <div className="space-y-5">
          <div className="border-b border-[#E2E8F0] pb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#4F46E5]">
              Datastraw Ops
            </p>
            <p className="mt-1 text-[16px] font-semibold leading-6 tracking-[-0.01em] text-[#0F172A]">
              RosterIQ Console
            </p>
            <p className="mt-0.5 text-[12px] text-[#64748B]">
              30 Staff · 20 Brands · 5 Pods
            </p>
          </div>

          <nav aria-label="Primary Workspace Navigation" className="flex flex-wrap gap-1.5 lg:flex-col">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center justify-between rounded-[4px] px-3 py-2 text-[13px] font-medium transition ${
                    isActive
                      ? "bg-[#EEF2FF] text-[#4F46E5] ring-1 ring-[#4F46E5]/20"
                      : "text-[#334155] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="tabular-nums text-[11px] font-semibold text-[#64748B]">
                    {item.code}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-6 hidden rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] p-3 lg:block">
          <p className="text-[11px] font-semibold uppercase tracking-[0.02em] text-[#64748B]">
            Scheduling Rules
          </p>
          <p className="mt-1 text-[12px] leading-4 text-[#334155] tabular-nums">
            16 Dedicated (80%) · 4 Shared (20%) · 4 Processes
          </p>
        </div>
      </div>
    </aside>
  );
}