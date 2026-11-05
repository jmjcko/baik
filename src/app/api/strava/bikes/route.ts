import { listBikes } from '@/lib/strava/handlers';
import { routeDeps } from '@/lib/strava/deps';

export const dynamic = 'force-dynamic';

export async function GET() {
  return listBikes(await routeDeps());
}
