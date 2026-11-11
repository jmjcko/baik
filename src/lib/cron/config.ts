import { readIntervalsConfig, type IntervalsConfig } from '@/lib/intervals/config';
import { readSupabaseConfig } from '@/lib/supabase/config';

/**
 * The settings of the daily cron (Epic 56, story 56.2): all of them come from the environment of the server and are read only here and in the route.
 * `serviceKey` is the service role key of Supabase: it skips row level security, so nothing but the cron may import this file.
 */
export interface CronConfig {
  secret: string;
  serviceKey: string;
  url: string;
  intervals: IntervalsConfig;
}

type Env = Record<string, string | undefined>;

const MIN_SECRET = 32;

/** The settings, or null when any of them is missing (the route then answers 503 and does nothing). */
export function readCronConfig(env: Env = process.env): CronConfig | null {
  const secret = env.CRON_SECRET?.trim() ?? '';
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? '';
  const supabase = readSupabaseConfig({ url: env.NEXT_PUBLIC_SUPABASE_URL, anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY });
  const intervals = readIntervalsConfig(env);
  if (secret.length < MIN_SECRET || !serviceKey || !supabase || !intervals) return null;
  return { secret, serviceKey, url: supabase.url, intervals };
}
