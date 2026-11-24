"use server";

import { getServerSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import {
  replaceGeneratedRosterEntries,
  type PersistRosterMonthPayload,
} from "@/lib/roster/repository";

export interface SupabaseConfigStatus {
  configured: boolean;
  message: string;
}

export async function checkSupabaseConfigAction(): Promise<SupabaseConfigStatus> {
  const envCheck = getServerSupabaseEnv();
  if (!envCheck.success) {
    return {
      configured: false,
      message:
        "Supabase is not configured in this environment (missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL). Working in deterministic local memory mode.",
    };
  }

  return {
    configured: true,
    message: "Supabase connection is configured with server admin credentials.",
  };
}

export interface PersistResult {
  success: boolean;
  configured: boolean;
  message: string;
  insertedCount?: number;
  conflictCount?: number;
}

export async function persistRosterMonthAction(
  payload: PersistRosterMonthPayload
): Promise<PersistResult> {
  const envCheck = getServerSupabaseEnv();
  if (!envCheck.success) {
    return {
      success: false,
      configured: false,
      message:
        "Cannot persist to Supabase: server environment variables (NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY) are not configured. No changes were saved to a database.",
    };
  }

  try {
    const db = createSupabaseAdminClient();
    const result = await replaceGeneratedRosterEntries(db, payload);
    return {
      success: true,
      configured: true,
      insertedCount: result.insertedCount,
      conflictCount: result.conflictCount,
      message: `Successfully persisted ${result.insertedCount} roster entries and ${result.conflictCount} conflicts to Supabase.`,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      configured: true,
      message: `Failed to persist to Supabase: ${errorMsg}`,
    };
  }
}
