import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { RIDER_PAIN_TYPES, RIDING_DISCIPLINES } from '@/types/baikfit';
import { POSTURE_STYLES } from '../types';

const migration = readdirSync('supabase/migrations').find((name) => name.endsWith('rider_profiles.sql'))!;
const sql = readFileSync(`supabase/migrations/${migration}`, 'utf8');
const removal = readFileSync('supabase/migrations/20261028000000_remove_trekking.sql', 'utf8');
const list = (values: readonly string[]) => values.map((v) => `'${v}'`).join(', ');

describe('rider_profiles migration (guard for the passport contract)', () => {
  it('should keep the disciplines and posture styles of the app in the table constraints', () => {
    expect(sql).toContain(`posture_style in (${list(POSTURE_STYLES)})`);
    // The discipline constraint is the last one that was written (trekking was removed by a later migration).
    expect(removal).toContain(`check (discipline in (${list(RIDING_DISCIPLINES)}))`);
    expect(removal).toContain("set discipline = 'gravel' where discipline = 'trekking'");
  });

  it('should reference auth.users and delete the passport with the user', () => {
    expect(sql).toMatch(/id uuid primary key references auth\.users \(id\) on delete cascade/);
  });

  it('should enable row level security with owner only policies for all four operations', () => {
    expect(sql).toContain('alter table public.rider_profiles enable row level security');
    for (const op of ['select', 'insert', 'update', 'delete']) {
      expect(sql, op).toMatch(new RegExp(`create policy \\w+ on public\\.rider_profiles\\s+for ${op} to authenticated`));
    }
    expect(sql.match(/auth\.uid\(\) = id/g)?.length).toBeGreaterThanOrEqual(5);
  });

  it('should give no access to anonymous or public roles and never mention the service role', () => {
    expect(sql).not.toMatch(/to (anon|public)\b/i);
    expect(sql).not.toMatch(/service_role/i);
    expect(sql).not.toMatch(/using \(true\)|with check \(true\)/i);
  });

  it('should keep the document sizes bounded and the updated_at trigger with a fixed search path', () => {
    expect(sql).toContain('pg_column_size(bikes) < 16384');
    expect(sql).toContain("set search_path = ''");
    expect(sql).toContain('before update on public.rider_profiles');
  });

  it('should list every symptom of the app in the column documentation', () => {
    for (const pain of RIDER_PAIN_TYPES) expect(sql).toContain(pain);
  });
});

describe('environment example and git ignore', () => {
  const example = readFileSync('.env.example', 'utf8');

  it('should name the two public variables and warn against the service role key', () => {
    expect(example).toMatch(/^NEXT_PUBLIC_SUPABASE_URL=/m);
    expect(example).toMatch(/^NEXT_PUBLIC_SUPABASE_ANON_KEY=/m);
    expect(example).toMatch(/NEVER put the service_role key/);
    expect(example).not.toMatch(/^[A-Z_]*SERVICE_ROLE[A-Z_]*=/m);
  });

  it('should not contain a real key (placeholders only) and keep local env files out of git', () => {
    expect(example).not.toMatch(/eyJ[A-Za-z0-9_-]{20,}/);
    expect(example).toContain('your-anon-key');
    expect(readFileSync('.gitignore', 'utf8')).toMatch(/^\.env\*\.local$/m);
  });
});
