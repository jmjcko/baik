# Strava: one-time setup (Epic 51, story 51.3)

0. **A Strava subscription is a prerequisite for creating an app** (https://developers.strava.com/docs/getting-started/). Without it the integration cannot be tried; the logbook works with rides typed by hand.
1. Register the app at https://www.strava.com/settings/api. **Authorization Callback Domain**: `localhost` for development, your domain in production. Note the Client ID and the Client Secret.
2. Create a key for the tokens: `openssl rand -base64 32`.
3. Put three lines in `.env.local` (git-ignored; the assistant never reads it), then restart the dev server:
   ```
   STRAVA_CLIENT_ID=<the number>
   STRAVA_CLIENT_SECRET=<the secret>
   STRAVA_TOKEN_KEY=<the key from step 2>
   ```
   Keep the key: with a new key the stored tokens cannot be read and the rider has to connect again.
4. In the Supabase SQL editor run `supabase/migrations/20261106000000_strava_connections.sql` (safe to run again).
5. Download "Connect with Strava" (orange) from https://developers.strava.com/guidelines/ and save it as `public/strava/btn_strava_connectwith_orange.svg` (see the README there).
6. Sign in, open bAIkcare, Garage, Wear, press "Connect with Strava".

A new Strava app starts in single-player mode (only your own account can connect); raising it in the API settings gives 10 athletes, more needs a review by Strava. The default rate limit is 200 requests per 15 minutes and 2,000 per day. Strava data is shown only to its owner and is never sent to an AI or used to train a model (Strava API agreement).
