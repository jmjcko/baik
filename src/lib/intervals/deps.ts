import { createSupabaseServerClient } from '@/lib/supabase/server';
import { readIntervalsConfig } from './config';
import type { Deps } from './handlers';

/** The real dependencies of a route: the Supabase client of the request, the settings of the server and `fetch`. */
export async function routeDeps(): Promise<Deps> {
  return { client: await createSupabaseServerClient(), config: readIntervalsConfig(), fetcher: (url, init) => fetch(url, init) };
}
