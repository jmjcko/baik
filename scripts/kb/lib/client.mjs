import { readFileSync, existsSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const FILE = '.env.kb.local';

/** KEY=value lines of the file of the curator (never printed); the environment wins over the file. */
function settings() {
  const values = {};
  if (existsSync(FILE)) {
    for (const line of readFileSync(FILE, 'utf8').split('\n')) {
      const match = /^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/.exec(line);
      if (match) values[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  }
  return { ...values, ...process.env };
}

/** A client that is signed in as the curator "kb-curator": it can touch the kb_* tables only (row level security), nothing else. */
export async function connect() {
  const env = settings();
  const missing = ['KB_SUPABASE_URL', 'KB_SUPABASE_ANON_KEY', 'KB_CURATOR_EMAIL', 'KB_CURATOR_PASSWORD'].filter((key) => !env[key]);
  if (missing.length > 0) {
    console.error(`Missing ${missing.join(', ')}. Put them in ${FILE} (it is in .gitignore).`);
    process.exit(1);
  }
  const db = createClient(env.KB_SUPABASE_URL, env.KB_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  const { error } = await db.auth.signInWithPassword({ email: env.KB_CURATOR_EMAIL, password: env.KB_CURATOR_PASSWORD });
  if (error) {
    console.error(`Sign in as the curator failed: ${error.message}`);
    process.exit(1);
  }
  return db;
}
