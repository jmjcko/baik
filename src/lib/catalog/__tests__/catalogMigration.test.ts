import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { SIZE_LIMITS } from '@/lib/bikes/parseSizeSpec';

const sql = readFileSync('supabase/migrations/20261025000000_bike_catalog.sql', 'utf8');
const ADMIN_FUNCTIONS = ['approve_submission', 'merge_submission', 'reject_submission', 'admin_save_bike', 'admin_delete_catalog_bike'];

/** The body of one function of the migration. */
const bodyOf = (name: string): string => {
  const start = sql.indexOf(`function public.${name}(`);
  return sql.slice(start, sql.indexOf('$$;', sql.indexOf('as $$', start)) + 3);
};

describe('bike catalog migration (guard)', () => {
  it('should keep the plausible ranges of the database equal to SIZE_LIMITS of the app', () => {
    const found = [...sql.matchAll(/spec_number_ok\(spec, '(\w+)', (-?\d+), (\d+), (true|false)\)/g)];
    expect(found).toHaveLength(Object.keys(SIZE_LIMITS).length);
    for (const [, key, lo, hi, required] of found) {
      const [min, max] = SIZE_LIMITS[key as keyof typeof SIZE_LIMITS];
      expect([key, Number(lo), Number(hi)]).toEqual([key, min, max]);
      expect(required === 'true', key).toBe(['frameStackMm', 'frameReachMm', 'seatTubeAngleDeg'].includes(key));
    }
  });

  it('should enable row level security on all three tables', () => {
    for (const table of ['app_admins', 'bike_catalog', 'bike_submissions']) expect(sql).toContain(`alter table public.${table} enable row level security`);
  });

  it('should let anyone read the catalog but give nobody a direct way to write it', () => {
    expect(sql).toMatch(/create policy bike_catalog_read_all on public\.bike_catalog\s+for select to anon, authenticated using \(true\)/);
    expect(sql).not.toMatch(/on public\.bike_catalog\s+for (insert|update|delete)/);
    expect(sql).not.toMatch(/on public\.app_admins\s+for (insert|update|delete)/);
  });

  it('should limit the submissions of a rider to the own rows and to pending ones', () => {
    expect(sql).toMatch(/bike_submissions_select[\s\S]*using \(auth\.uid\(\) = user_id or public\.is_admin\(\)\)/);
    expect(sql).toMatch(/bike_submissions_insert_own[\s\S]*with check \(auth\.uid\(\) = user_id and status = 'pending'/);
    expect(sql).toMatch(/bike_submissions_update_own_pending[\s\S]*using \(auth\.uid\(\) = user_id and status = 'pending'\)/);
    expect(sql).toMatch(/bike_submissions_delete_own[\s\S]*using \(auth\.uid\(\) = user_id\)/);
    expect(sql).not.toMatch(/on public\.bike_submissions[\s\S]{0,80}to (anon|public)\b/);
  });

  it('should drop the link to the account when the account is deleted and keep one submission per rider and bike size', () => {
    expect(sql).toMatch(/user_id uuid references auth\.users \(id\) on delete set null/);
    expect(sql).toContain('constraint bike_submissions_one_per_rider unique (user_id, key)');
    expect(sql).toContain('>= 100');
  });

  it.each(ADMIN_FUNCTIONS)('should let only an admin run %s, with the rights of its owner and a fixed search path', (name) => {
    const body = bodyOf(name);
    expect(body).toMatch(/security definer/);
    expect(body).toContain("set search_path = ''");
    expect(body).toMatch(/if not public\.is_admin\(\) then\s+raise exception 'not allowed' using errcode = '42501'/);
  });

  it('should give the admin functions to signed in users only (they check the admin themselves) and nothing to anon or public', () => {
    for (const name of ADMIN_FUNCTIONS) {
      expect(sql, name).toMatch(new RegExp(`revoke all on function public\\.${name}\\([^)]*\\) from public, anon;`));
      expect(sql, name).toMatch(new RegExp(`grant execute on function public\\.${name}\\([^)]*\\) to authenticated;`));
    }
    expect(sql).toMatch(/revoke all on function public\.recount_confirmations\(uuid\) from public, anon, authenticated;/);
    expect(sql).not.toMatch(/grant [^;]* to [^;]*\b(anon|public)\b/);
    expect(sql).not.toMatch(/service_role/i);
  });

  it('should never trust a key from the client: it is generated from brand, model, year and size', () => {
    expect(sql.match(/key text generated always as \(public\.bike_key\(brand, model, year, size\)\) stored/g)).toHaveLength(2);
  });

  it('should make an approval a catalog entry from the owner view and count the approved submissions', () => {
    const body = bodyOf('approve_submission');
    expect(body).toContain("'community'");
    expect(body).toContain('on conflict on constraint bike_catalog_key_unique');
    expect(body).toContain('recount_confirmations');
    expect(bodyOf('admin_save_bike')).toContain("'owner'");
  });

  it('should give the first admin by hand only', () => {
    expect(sql).toContain('insert into public.app_admins (user_id) values');
    expect(sql).not.toMatch(/^insert into public\.app_admins/m);
  });
});
