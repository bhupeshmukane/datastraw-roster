"use server";

import { z } from "zod";
import { getServerSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import {
  replaceGeneratedRosterEntries,
  upsertManualRosterEntry,
  resolveRosterConflict,
  loadRosterData,
  PersistRosterMonthPayloadSchema,
  PersistManualEditPayloadSchema,
  ResolveConflictPayloadSchema,
  type LoadedRosterResult,
} from "@/lib/roster/repository";
import type { RosterEntry } from "@/lib/validation/roster";

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

const LoadRosterInputSchema = z.object({
  year: z.number().int().min(2024).max(2100),
  month: z.number().int().min(1).max(12),
});

export async function loadRosterDataAction(
  rawInput: unknown
): Promise<{ success: boolean; result: LoadedRosterResult }> {
  const parsed = LoadRosterInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new Error(`Invalid year/month parameters: ${parsed.error.message}`);
  }

  const result = await loadRosterData(parsed.data.year, parsed.data.month);
  return {
    success: true,
    result,
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
  rawPayload: unknown
): Promise<PersistResult> {
  const parsed = PersistRosterMonthPayloadSchema.safeParse(rawPayload);
  if (!parsed.success) {
    return {
      success: false,
      configured: false,
      message: `Invalid roster month payload: ${parsed.error.message}`,
    };
  }

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
    const result = await replaceGeneratedRosterEntries(db, parsed.data);
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

export interface ManualEditResult {
  success: boolean;
  configured: boolean;
  message: string;
  entry?: RosterEntry;
}

export async function persistManualEditAction(
  rawPayload: unknown
): Promise<ManualEditResult> {
  const parsed = PersistManualEditPayloadSchema.safeParse(rawPayload);
  if (!parsed.success) {
    return {
      success: false,
      configured: false,
      message: `Invalid manual edit payload: ${parsed.error.message}`,
    };
  }

  const envCheck = getServerSupabaseEnv();
  if (!envCheck.success) {
    return {
      success: false,
      configured: false,
      message:
        "Cannot persist manual edit: Supabase environment variables are not configured. Edit preserved in local memory.",
    };
  }

  try {
    const db = createSupabaseAdminClient();
    const result = await upsertManualRosterEntry(db, parsed.data);
    return {
      success: true,
      configured: true,
      entry: result.entry,
      message: `Persisted manual edit for employee ${parsed.data.employeeId} on ${parsed.data.workDate} to Supabase.`,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      configured: true,
      message: `Failed to persist manual edit in Supabase: ${errorMsg}`,
    };
  }
}

export interface ResolveConflictResult {
  success: boolean;
  configured: boolean;
  message: string;
}

export async function resolveConflictAction(
  rawPayload: unknown
): Promise<ResolveConflictResult> {
  const parsed = ResolveConflictPayloadSchema.safeParse(rawPayload);
  if (!parsed.success) {
    return {
      success: false,
      configured: false,
      message: `Invalid conflict resolution payload: ${parsed.error.message}`,
    };
  }

  const envCheck = getServerSupabaseEnv();
  if (!envCheck.success) {
    return {
      success: false,
      configured: false,
      message:
        "Cannot persist conflict resolution: Supabase environment variables are not configured. Resolution maintained in local memory.",
    };
  }

  try {
    const db = createSupabaseAdminClient();
    await resolveRosterConflict(db, parsed.data);
    return {
      success: true,
      configured: true,
      message: `Successfully resolved ${parsed.data.conflictType} conflict on ${parsed.data.workDate} in Supabase.`,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      configured: true,
      message: `Failed to resolve conflict in Supabase: ${errorMsg}`,
    };
  }
}
