"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  badge?: string;
  badgeColor?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Operations Dashboard",
  },
  {
    href: "/roster",
    label: "Monthly Roster",
  },
  {
    href: "/employees",
    label: "Employee Management",
    badge: "30",
  },
  {
    href: "/brands",
    label: "Brand Management",
    badge: "20",
  },
  {
    href: "/conflicts",
    label: "Conflict Center",
    badge: "Active",
    badgeColor: "bg-[#FEF2F2] text-[#EF4444]",
  },
  {
    href: "/validation",
    label: "Roster Validation",
    badge: "PASS",
    badgeColor: "bg-[#ECFDF5] text-[#10B981]",
  },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-[#E2E8F0] bg-white lg:border-b-0 lg:border-r">
      <div className="flex flex-col justify-between p-4 lg:sticky lg:top-0 lg:h-screen lg:p-5">
        <div className="space-y-6">
          {/* Header Branding */}
          <div className="border-b border-[#E2E8F0] pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-[#4F46E5] text-[13px] font-bold text-white shadow-xs">
                DS
              </div>
              <div>
                <span className="block text-[11px] font-semibold tracking-wider text-[#4F46E5] uppercase">
                  Datastraw Ops
                </span>
                <span className="block text-[15px] font-semibold leading-tight text-[#0F172A]">
                  RosterIQ Console
                </span>
              </div>
            </div>
            <p className="mt-2 text-[12px] text-[#64748B]">
              Deterministic Workforce Ops
            </p>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Primary Workspace Navigation" className="flex flex-wrap gap-1 lg:flex-col">
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
                      ? "bg-[#EEF2FF] text-[#4F46E5] font-semibold ring-1 ring-[#4F46E5]/20"
                      : "text-[#334155] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`ml-2 rounded-[4px] px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                        item.badgeColor ?? "bg-[#F1F5F9] text-[#64748B]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Operational Scope Footer Widget */}
        <div className="mt-6 rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
              Operational Scope
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
          </div>
          <div className="mt-2 space-y-1 text-[12px] text-[#334155] tabular-nums">
            <div className="flex justify-between">
              <span className="text-[#64748B]">Workforce:</span>
              <span className="font-medium text-[#0F172A]">30 Operators</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Brands:</span>
              <span className="font-medium text-[#0F172A]">16 Ded / 4 Shared</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Topology:</span>
              <span className="font-medium text-[#0F172A]">5 Pods · 4 Procs</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
