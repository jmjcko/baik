import { createSupabaseServerClient } from '@/lib/supabase/server';

/** The signed in user of the request when they are an admin (the database decides: `is_admin()`), null when not, 'not_configured' without a database. */
export async function adminUserId(): Promise<string | null | 'not_configured'> {
  const client = await createSupabaseServerClient();
  if (!client) return 'not_configured';
  const { data } = await client.auth.getUser();
  if (!data.user) return null;
  const { data: admin } = await client.rpc('is_admin');
  return admin === true ? data.user.id : null;
}
