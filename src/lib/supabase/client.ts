import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { readSupabaseConfig, type SupabaseConfig } from './config';

let cached: SupabaseClient | null | undefined;

/** The Supabase client of the browser (one per page), or null on the server or when Supabase is not configured. Only the anon key is used. */
export function getBrowserClient(config: SupabaseConfig | null = readSupabaseConfig()): SupabaseClient | null {
  if (!config || typeof window === 'undefined') return null;
  cached ??= createBrowserClient(config.url, config.anonKey);
  return cached;
}

/** For tests: forget the client that was created before. */
export function resetBrowserClient(): void {
  cached = undefined;
}
