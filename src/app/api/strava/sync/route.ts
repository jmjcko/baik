import { syncRides } from '@/lib/strava/handlers';
import { routeDeps } from '@/lib/strava/deps';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  return syncRides(request, await routeDeps());
}
