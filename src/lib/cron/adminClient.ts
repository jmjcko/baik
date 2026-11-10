import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { CronConfig } from './config';

/** The client of the cron: the service role, no session kept. Every query of the cron names the user it works for. */
export const createAdminClient = (config: CronConfig): SupabaseClient => createClient(config.url, config.serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
