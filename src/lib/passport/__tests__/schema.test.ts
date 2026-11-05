import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { RIDER_PAIN_TYPES, RIDING_DISCIPLINES } from '@/types/baikfit';
import { POSTURE_STYLES } from '../types';

const migration = readdirSync('supabase/migrations').find((name) => name.endsWith('rider_profiles.sql'))!;
const sql = readFileSync(`supabase/migrations/${migration}`, 'utf8');
const removal = readFileSync('supabase/migrations/20261028000000_remove_trekking.sql', 'utf8');
const ridersSql = readFileSync('supabase/migrations/20261102000000_rider_profiles_riders.sql', 'utf8');
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
    /* The list was extended by a later migration (leg_length), so the symptoms are read from the original and from the ones that follow it. */
    const documented = readdirSync('supabase/migrations').sort().map((name) => readFileSync(`supabase/migrations/${name}`, 'utf8')).join('\n');
    for (const pain of RIDER_PAIN_TYPES) expect(documented).toContain(pain);
  });
});

describe('riders migration (Epic 43)', () => {
  it('should only add: a nullable riders column checked to be an array, and nothing is dropped but the two constraints that it replaces', () => {
    expect(ridersSql).toContain('add column if not exists riders jsonb;');
    expect(ridersSql).toContain("check (riders is null or jsonb_typeof(riders) = 'array')");
    expect(ridersSql).not.toMatch(/drop (column|table)/i);
    expect(ridersSql.match(/drop constraint/gi)).toHaveLength(2);
    expect(ridersSql).toContain('drop constraint if exists rider_profiles_riders_is_array');
    expect(ridersSql).toContain('drop constraint if exists rider_profiles_size');
  });

  it('should be safe to run again: every drop is guarded and the column is added only when missing', () => {
    expect(ridersSql.match(/drop constraint (?!if exists)/gi)).toBeNull();
    expect(ridersSql).not.toMatch(/add column (?!if not exists)/i);
  });

  it('should bound the new document sizes and keep the access rules of the table untouched', () => {
    expect(ridersSql).toContain('pg_column_size(riders) < 16384');
    expect(ridersSql).toContain('pg_column_size(bikes) < 32768');
    expect(ridersSql).not.toMatch(/policy|grant|to (anon|public)\b|service_role/i);
  });

  it('should run after the migrations it builds on (the names sort in the order of running, and a later migration may follow it)', () => {
    const names = readdirSync('supabase/migrations').sort();
    const riders = names.indexOf('20261102000000_rider_profiles_riders.sql');
    expect(riders).toBeGreaterThan(names.indexOf('20261028000000_remove_trekking.sql'));
    expect(riders).toBeGreaterThan(names.indexOf('20261023000000_rider_profiles.sql'));
    expect(names.every((name, i) => i === 0 || name > names[i - 1])).toBe(true);
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

describe('gear purchases migration (Epic 47)', () => {
  const sql = readFileSync('supabase/migrations/20261103000000_gear_purchases.sql', 'utf8');

  it('should limit every row to its owner by row level security and refuse an eleventh purchase', () => {
    expect(sql).toMatch(/enable row level security/i);
    for (const action of ['select', 'insert', 'update', 'delete']) expect(sql).toMatch(new RegExp(`for ${action} to authenticated`, 'i'));
    expect(sql).toMatch(/auth\.uid\(\) = user_id/);
    expect(sql).toMatch(/>= 10/);
    expect(sql).not.toMatch(/to (anon|public)\b|service_role/i);
  });

  it('should be safe to run again and hold no body or bike columns', () => {
    expect(sql).toMatch(/create table if not exists public\.gear_purchases/i);
    expect(sql).toMatch(/drop policy if exists/i);
    expect(sql).toMatch(/drop trigger if exists/i);
    expect(sql).not.toMatch(/anatomy|symptoms|bikes\b/i);
  });
});

describe('knowledge evidence migration (Epic 50)', () => {
  const sql = readFileSync('supabase/migrations/20261105000000_kb_knowledge.sql', 'utf8');

  it('should let only curators touch the tables, with row level security on each', () => {
    for (const table of ['kb_curators', 'kb_topics', 'kb_sources', 'kb_claims']) expect(sql).toMatch(new RegExp(`${table}[\\s\\S]*enable row level security|enable row level security[\\s\\S]*${table}`, 'i'));
    expect(sql).toMatch(/is_kb_curator\(\)/);
    expect(sql).toMatch(/security_invoker/i);
    expect(sql).not.toMatch(/to (anon|public)\b|service_role/i);
  });

  it('should be safe to run again and never hold a transcript', () => {
    expect(sql).toMatch(/create table if not exists public\.kb_claims/i);
    expect(sql).toMatch(/drop policy if exists/i);
    expect(sql.replace(/--.*$/gm, '')).not.toMatch(/transcript/i);
  });
});

describe('knowledge inbox migration (Epic 50)', () => {
  const sql = readFileSync('supabase/migrations/20261105100000_kb_inbox.sql', 'utf8');

  it('should be curators only, limited in size and safe to run again', () => {
    expect(sql).toMatch(/enable row level security/i);
    expect(sql).toMatch(/is_kb_curator\(\)/);
    expect(sql).toMatch(/create table if not exists public\.kb_inbox/i);
    expect(sql).toMatch(/drop policy if exists/i);
    expect(sql).toMatch(/char_length\(body\) between 1 and 300000/);
    expect(sql).toMatch(/alter column body drop not null/i);
    expect(sql).not.toMatch(/to (anon|public)\b|service_role/i);
  });
});
