import { createClient } from "@supabase/supabase-js";

/**
 * Public Supabase client (no cookie management).
 * Use this in statically cached pages (ISR) that serve public data.
 * The anon key's RLS policies still apply.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
