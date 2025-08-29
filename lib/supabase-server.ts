import { createClient } from "@supabase/supabase-js";

export function createServerSupabaseClient(authHeader?: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    authHeader
      ? { global: { headers: { Authorization: authHeader } } }
      : undefined
  );
}


