import { cronRides } from '@/lib/cron/handler';
import { readCronConfig } from '@/lib/cron/config';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return cronRides(request, readCronConfig());
}
