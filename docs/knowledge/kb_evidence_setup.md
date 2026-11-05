# Evidence base: one-time setup (Epic 50)

"kb-curator" is only the name of the role. In Supabase a user is an e-mail plus a password; there is no name field.

## 1. Run the migration
Supabase, SQL Editor, New query: paste the whole file `supabase/migrations/20261105000000_kb_knowledge.sql`, press Run. It is safe to run again.

## 2. Create the curator user
1. Supabase, Authentication, Users, button **Add user**, **Create new user**.
2. E-mail: an address that is not used by any other account. A Gmail trick: `jmjcko+kb-curator@gmail.com` lands in your normal inbox but is a separate user.
3. Password: a long random one (a password manager is ideal). Save it, you need it in step 4.
4. Tick **Auto Confirm User**, then Create user.

## 3. Allow the user to use the evidence tables
SQL Editor, new query (use the same e-mail as in step 2):

```sql
insert into public.kb_curators (user_id)
select id from auth.users where email = 'jmjcko+kb-curator@gmail.com'
on conflict do nothing;
```

It should say 1 row affected. If it says 0, the e-mail is misspelled.

## 4. Create `.env.kb.local`
In the repository root (next to `package.json`) create a file named `.env.kb.local` (git-ignored; the assistant never reads it):

```
KB_SUPABASE_URL=https://<project>.supabase.co
KB_SUPABASE_ANON_KEY=<public key>
KB_CURATOR_EMAIL=jmjcko+kb-curator@gmail.com
KB_CURATOR_PASSWORD=<the password from step 2>
```

Where to find the two values: Supabase, Project Settings, **API Keys** (or **Data API**). The URL is the Project URL. The key is the **anon / public** key (or the **publishable** key, `sb_publishable_...`). Never use the `service_role` / secret key here. You can copy both from your existing `.env.local` (the same values as `NEXT_PUBLIC_SUPABASE_URL` and the public key).

## 5. Load the knowledge bases
Run `npm run kb:seed` (or tell the assistant to). It signs in as the curator and loads the topics and rules of the released files. Check with `npm run kb:report`, then open the admin page, tab "Sources and findings".

## 6. Second migration (the inbox)
Run `supabase/migrations/20261105100000_kb_inbox.sql` the same way as in step 1 (run it again after an update of the file: it is idempotent and it makes the title, the channel and the transcript optional).

Optional tool for downloading transcripts: `brew install yt-dlp`.

## Daily use
Admin page, tab "Sources and findings", form "Add a video": paste the link (the transcript only if the video has none), press the button, then tell the assistant in the chat to process the inbox. It runs `npm run kb:inbox`, reads the transcript, saves the claims with `npm run kb:add -- file.json` and removes the item.
