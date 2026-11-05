import { finishAuth } from '@/lib/strava/handlers';
import { routeDeps } from '@/lib/strava/deps';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return finishAuth(request, await routeDeps());
}
