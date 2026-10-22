export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

const PLACEHOLDERS = ['your-project-ref', 'your-anon-key'];
const MAX_KEY_LENGTH = 4096;

function isUsableUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    return url.protocol === 'https:' || (local && url.protocol === 'http:');
  } catch {
    return false;
  }
}

/**
 * The public Supabase settings, or null when they are missing, malformed or still the placeholders of `.env.example`
 * (the app then works as a guest only). The NEXT_PUBLIC variables are read literally so that Next.js can inline them.
 */
export function readSupabaseConfig(
  env: { url?: string; anonKey?: string } = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }
): SupabaseConfig | null {
  const url = env.url?.trim() ?? '';
  const anonKey = env.anonKey?.trim() ?? '';
  if (!url || !anonKey || anonKey.length > MAX_KEY_LENGTH) return null;
  if (PLACEHOLDERS.some((placeholder) => url.includes(placeholder) || anonKey.includes(placeholder))) return null;
  return isUsableUrl(url) ? { url, anonKey } : null;
}
