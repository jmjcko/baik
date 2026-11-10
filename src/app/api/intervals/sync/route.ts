import { syncKey } from '@/lib/intervals/handlers';
import { routeDeps } from '@/lib/intervals/deps';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  return syncKey(request, await routeDeps());
}
