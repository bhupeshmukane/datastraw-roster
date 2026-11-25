"use client";

import { useEffect, useState } from "react";
import { checkSupabaseConfigAction, type SupabaseConfigStatus } from "@/app/actions/roster";
import { useRosterWorkflow } from "./RosterWorkflowContext";

export function SupabaseStatusBanner() {
  const {
    year,
    month,
    dataSource,
    dataSourceMessage,
    changeCycle,
    persistCurrentRoster,
    isPersisting,
    persistenceStatus,
    clearPersistenceStatus,
  } = useRosterWorkflow();

  const [configStatus, setConfigStatus] = useState<SupabaseConfigStatus | null>(
    null
  );
  const [checking, setChecking] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    checkSupabaseConfigAction()
      .then((status) => {
        if (mounted) {
          setConfigStatus(status);
          setChecking(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setConfigStatus({
            configured: false,
            message:
              "Could not verify server Supabase configuration. Operating in local memory mode.",
          });
          setChecking(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-2">
      {/* Configuration Status Banner */}
      {!checking && configStatus && !configStatus.configured && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-[#E2E8F0] bg-white p-3.5 shadow-xs">
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] bg-[#F1F5F9] text-[11px] font-bold text-[#64748B]">
              DB
            </span>
            <div>
              <p className="text-[13px] font-semibold text-[#0F172A]">
                Persistence Boundary: Supabase Not Configured
              </p>
              <p className="text-[12px] text-[#64748B]">
                {configStatus.message} Real engine state is fully active in memory; database persistence is never faked.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => persistCurrentRoster()}
            disabled={isPersisting}
            className="rounded-[4px] border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-[12px] font-medium text-[#334155] transition hover:bg-[#F1F5F9] disabled:opacity-50"
          >
            {isPersisting ? "Testing Server Boundary..." : "Test Persistence Boundary"}
          </button>
        </div>
      )}

      {/* Configured in env, but fell back to baseline fixture (e.g. missing grants or unseeded tables) */}
      {!checking &&
        configStatus?.configured &&
        dataSource === "BASELINE_FIXTURE" &&
        dataSourceMessage && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-[#FDE68A] bg-[#FFFBEB] p-3.5 text-[#92400E] shadow-xs">
            <div>
              <p className="text-[13px] font-semibold">
                Supabase Connected — Using Baseline Fallback
              </p>
              <p className="mt-0.5 text-[12px]">{dataSourceMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => void changeCycle(year, month)}
              className="rounded-[4px] border border-[#F59E0B]/40 bg-white px-3 py-1.5 text-[12px] font-medium text-[#92400E] transition hover:bg-[#FEF3C7]"
            >
              Retry DB Load
            </button>
          </div>
        )}

      {/* Action Result Notification Banner */}
      {persistenceStatus && (
        <div
          className={`flex items-start justify-between gap-3 rounded-[8px] border p-3.5 shadow-xs transition ${
            persistenceStatus.success
              ? "border-[#A7F3D0] bg-[#ECFDF5] text-[#065F46]"
              : "border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]"
          }`}
        >
          <div>
            <p className="text-[13px] font-semibold">
              {persistenceStatus.success
                ? "Database Persistence Succeeded"
                : "Database Persistence Notice"}
            </p>
            <p className="mt-0.5 text-[12px]">{persistenceStatus.message}</p>
          </div>
          <button
            type="button"
            onClick={clearPersistenceStatus}
            className="text-[12px] font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
