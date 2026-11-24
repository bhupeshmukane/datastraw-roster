import { describe, expect, it } from "vitest";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { replaceGeneratedRosterEntries } from "@/lib/roster/repository";

describe("Supabase client & repository boundaries", () => {
  it("throws when public or server Supabase env vars are missing", () => {
    expect(() => createSupabaseBrowserClient()).toThrow();
    expect(() => createSupabaseAdminClient()).toThrow();
  });

  it("propagates database errors instead of fabricating success", async () => {
    const fakeDb = {
      from: () => ({
        delete: () => ({
          eq: () => ({
            eq: async () => ({
              error: { message: "connection refused" },
            }),
          }),
        }),
      }),
    } as unknown as Parameters<typeof replaceGeneratedRosterEntries>[0];

    await expect(
      replaceGeneratedRosterEntries(fakeDb, {
        rosterMonthId: "month-1",
        entries: [],
        conflicts: [],
      })
    ).rejects.toThrow("Failed to clear prior generated roster entries");
  });
});