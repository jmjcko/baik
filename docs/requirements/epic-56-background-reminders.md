# Epic 56: Reminders without an open page

**Status:** 📝 Requirements, approved in outline by the product owner on 2026-11-09 (no code yet). **Prerequisite:** story 55.3 (the service book and the setup mark follow the account).

## Goal
The rider hears from bAIk when a part of the bike needs attention (a notice level of the wear engine, a service date) **without opening the app**: the rides are loaded in the background and a message reaches the phone.

## Decisions of the product owner (2026-11-09)
- Rides are loaded in the background, so the connections must be readable by the server: the Intervals.icu key is stored **encrypted in the account** like the Strava tokens (the earlier rule "the key stays in this browser" ends with this epic).
- Channels: **Web Push** first (PWA, no domain needed), **Telegram** second (a bot, simple), e-mail later when there is a domain.

## Steps (each can be deployed alone)
1. **Intervals.icu key on the server**, encrypted (AES-256-GCM, `INTERVALS_TOKEN_KEY`), table `intervals_connections`; automatic load when the app opens.
2. **Daily cron** (`/api/cron/rides`, `CRON_SECRET`): loads the new rides of every connected account (Strava and Intervals.icu) into the books and counts the wear. Needs the server key `SUPABASE_SERVICE_ROLE_KEY`, only in that route.
3. **Notifier:** the pure `reminderEngine` decides what is due, a table of what was sent stops repeats (one message per part and notice level), channels are plug-ins.
4. **PWA and Web Push:** manifest, service worker, VAPID keys, one subscription per device, permission asked by the browser, a consent `notifications`, settings (on or off, per device).
5. **Telegram bot:** the rider presses a link `t.me/<bot>?start=<one-time token>`, the webhook `/api/telegram/webhook` (checked by its secret header) stores the chat of the rider; messages go out with plain `fetch`; `/stop` unlinks. The token of the bot is a server secret.
6. **E-mail** after a domain exists (sender with SPF and DKIM, one-click unsubscribe).

## Rules
No health data in a message (only the part and the bike name the rider gave). One message per part and level, at most one per day in total. A consent per channel, withdrawable in the profile; the privacy text names every recipient (the push service of the browser, Telegram, the mail provider). The two server secrets (service role, token keys) never reach the browser bundle (a test guards it).

## Risks
Vercel Hobby limits cron (once a day) and the length of a function; the plan may need a change when the riders grow. Web Push on iPhone works only for the app added to the home screen (verify the state in the EU). A push is not guaranteed to arrive.

## Out of scope now
Native apps, SMS, WhatsApp, a notification centre inside the app, marketing messages.
