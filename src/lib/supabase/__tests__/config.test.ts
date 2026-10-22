import { describe, it, expect } from 'vitest';
import { readSupabaseConfig } from '../config';

const KEY = 'sb_publishable_abcdefghijklmnop';

describe('readSupabaseConfig', () => {
  it('should accept an https project url with a key', () => {
    expect(readSupabaseConfig({ url: 'https://abcd1234.supabase.co', anonKey: KEY })).toEqual({ url: 'https://abcd1234.supabase.co', anonKey: KEY });
  });

  it('should trim the values and allow a local http url only for localhost', () => {
    expect(readSupabaseConfig({ url: ' http://localhost:54321 ', anonKey: ` ${KEY} ` })).toEqual({ url: 'http://localhost:54321', anonKey: KEY });
    expect(readSupabaseConfig({ url: 'http://127.0.0.1:54321', anonKey: KEY })).not.toBeNull();
    expect(readSupabaseConfig({ url: 'http://abcd1234.supabase.co', anonKey: KEY })).toBeNull();
  });

  it.each([
    [undefined, KEY], ['', KEY], ['https://abcd1234.supabase.co', undefined], ['https://abcd1234.supabase.co', ''], ['not a url', KEY], ['ftp://x.supabase.co', KEY],
    ['javascript:alert(1)', KEY],
  ])('should treat url %j with key %j as not configured', (url, anonKey) => {
    expect(readSupabaseConfig({ url, anonKey })).toBeNull();
  });

  it('should treat the placeholders of .env.example as not configured', () => {
    expect(readSupabaseConfig({ url: 'https://your-project-ref.supabase.co', anonKey: KEY })).toBeNull();
    expect(readSupabaseConfig({ url: 'https://abcd1234.supabase.co', anonKey: 'your-anon-key' })).toBeNull();
  });

  it('should refuse an oversized key', () => {
    expect(readSupabaseConfig({ url: 'https://abcd1234.supabase.co', anonKey: 'k'.repeat(5000) })).toBeNull();
  });

  it('should read the NEXT_PUBLIC variables by default and be not configured when they are missing', () => {
    expect(readSupabaseConfig()).toBeNull();
  });
});
