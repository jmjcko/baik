import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { readSupabaseConfig, type SupabaseConfig } from './config';

/** The Supabase client of a route handler or server component, bound to the cookies of the request; null when not configured. */
export async function createSupabaseServerClient(config: SupabaseConfig | null = readSupabaseConfig()): Promise<SupabaseClient | null> {
  if (!config) return null;
  const store = await cookies();
  return createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          /* called from a server component, which cannot set cookies: a route handler or the proxy refreshes the session */
        }
      },
    },
  });
}
