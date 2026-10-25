# Supabase Setup for bAIk (Auth and the Rider Passport)

Done once by the product owner. The app works without it (guest only).

1. Create a Supabase project. Copy the **Project URL** and the **anon (publishable) key** from Project Settings, API. Do not use or copy the `service_role` key anywhere in this repository.
2. Copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Restart `next dev`.
3. Run the migration `supabase/migrations/20261023000000_rider_profiles.sql` in the SQL editor (or with the Supabase CLI: `supabase db push`). Check in the Table editor that RLS is enabled on `rider_profiles`.
3b. Run the second migration `supabase/migrations/20261024000000_delete_my_account.sql` the same way (it creates `public.delete_my_account()`, which the "Delete my account" button of the profile page calls). Without it that button shows an error and nothing is deleted.
3c. Run the third migration `supabase/migrations/20261025000000_bike_catalog.sql` (the community catalog), then the fourth `supabase/migrations/20261026000000_app_accounts.sql` (a row per account in `app_accounts` with an `is_admin` switch; it replaces `app_admins`). Make yourself an admin in the Table Editor: `app_accounts`, set `is_admin` to true on your row; switch it off to revoke. Without the migration the catalog features are simply off; "Catalog admin" appears in the menu only for an admin.
3d. Run `supabase/migrations/20261027000000_auto_approve_and_misses.sql` (two agreeing riders approve a bike by themselves; the counter of bikes that riders did not find), then `supabase/migrations/20261028000000_remove_trekking.sql` (the discipline trekking is gone; saved passports become gravel). Run the migrations in the order of their names.
4. Authentication, Providers: enable **Email** (confirm email on, minimum password length 8) and **Google** (client id and secret from the Google Cloud console).
5. Authentication, URL Configuration: set the Site URL (for example `http://localhost:3001`) and add the redirect URL `<site>/auth/callback` (story 18.5 adds the route).
6. Magic link and confirmation e-mails: adjust the templates if needed (English and Czech).
7. Gemini (optional): put `GEMINI_API_KEY` into `.env.local` (server only). It is used for the reading of a bike from a link or a picture, the pre-purchase analysis and the owner's upload of tables. The free tier has a small daily limit; when it is used up the readings fail with "could not be read right now" until it resets or billing is turned on.
8. First admin: in the Table Editor open `app_accounts` and set `is_admin` to true on your row.

See [../architecture/application-overview.md](../architecture/application-overview.md) for what each part is used for.
