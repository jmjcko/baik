-- Self-service account deletion for the signed in rider (right to erasure).
-- The app only ever uses the anon key, so it cannot delete from auth.users itself: this function runs with the
-- rights of its owner but deletes only the row of the caller (auth.uid()). The Rider Passport row of the user is
-- removed by the cascade of rider_profiles.id -> auth.users.id.

create or replace function public.delete_my_account() returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
begin
  if caller is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  delete from auth.users where id = caller;
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

comment on function public.delete_my_account() is 'Deletes the account of the caller and, by cascade, the Rider Passport.';
