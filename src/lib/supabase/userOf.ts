import type { SupabaseClient } from '@supabase/supabase-js';

/** The signed in user of a request (asked of Supabase, never trusted from the browser), or null. */
export async function userOf(client: SupabaseClient | null): Promise<string | null> {
  if (!client) return null;
  const { data } = await client.auth.getUser();
  return data.user?.id ?? null;
}
