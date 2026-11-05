import { disconnect } from '@/lib/strava/handlers';
import { routeDeps } from '@/lib/strava/deps';

export const dynamic = 'force-dynamic';

export async function POST() {
  return disconnect(await routeDeps());
}
