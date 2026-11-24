import { createClient } from "@supabase/supabase-js";
import { getServerSupabaseEnv } from "./env";

export function createSupabaseAdminClient() {
  const parsed = getServerSupabaseEnv();
  if (!parsed.success) {
    throw new Error(
      "Missing server Supabase environment variables (URL, anon key, or service-role key)."
    );
  }

  return createClient(
    parsed.data.NEXT_PUBLIC_SUPABASE_URL,
    parsed.data.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}