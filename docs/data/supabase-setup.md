# Supabase Setup for bAIk (Auth and the Rider Passport)

Done once by the product owner. The app works without it (guest only).

1. Create a Supabase project. Copy the **Project URL** and the **anon (publishable) key** from Project Settings, API. Do not use or copy the `service_role` key anywhere in this repository.
2. Copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Restart `next dev`.
3. Run the migration `supabase/migrations/20261023000000_rider_profiles.sql` in the SQL editor (or with the Supabase CLI: `supabase db push`). Check in the Table editor that RLS is enabled on `rider_profiles`.
4. Authentication, Providers: enable **Email** (confirm email on, minimum password length 8) and **Google** (client id and secret from the Google Cloud console).
5. Authentication, URL Configuration: set the Site URL (for example `http://localhost:3001`) and add the redirect URL `<site>/auth/callback` (story 18.5 adds the route).
6. Magic link and confirmation e-mails: adjust the templates if needed (English and Czech).
