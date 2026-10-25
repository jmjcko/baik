import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const sql = readFileSync('supabase/migrations/20261027000000_auto_approve_and_misses.sql', 'utf8');

/** The body of one function of the migration. */
const bodyOf = (name: string): string => {
  const start = sql.indexOf(`function public.${name}(`);
  return sql.slice(start, sql.indexOf('$$;', sql.indexOf('as $$', start)) + 3);
};

describe('auto approval and misses migration (guard, the SQL itself is run by the owner in Supabase)', () => {
  it('should compare only stack, reach and seat tube angle', () => {
    const body = bodyOf('same_geometry');
    for (const key of ['frameStackMm', 'frameReachMm', 'seatTubeAngleDeg']) expect(body).toContain(`'${key}'`);
    expect(body).not.toMatch(/stockStemMm|stockHandlebarMm|stockCrankMm|topTubeMm|headTubeMm/);
  });

  it('should need two different riders for a bike that the catalog lacks, and run with fixed rights and path', () => {
    const body = bodyOf('auto_approve_submissions');
    expect(body).toContain('count(distinct s.user_id)');
    expect(body).toMatch(/\) < 2 then\s+return new;/);
    expect(body).toMatch(/security definer/);
    expect(body).toContain("set search_path = ''");
  });

  it('should ignore anonymous and non pending submissions, mark the entry as automatic and never overwrite an existing entry', () => {
    const body = bodyOf('auto_approve_submissions');
    expect(body).toContain("new.status <> 'pending' or new.user_id is null");
    expect(body).toContain("'community'");
    expect(body).toContain('auto_approved');
    expect(body).toContain('on conflict on constraint bike_catalog_key_unique do nothing');
    expect(body).not.toMatch(/do update/);
    expect(body).toContain('recount_confirmations');
  });

  it('should count as confirmations only the submissions with the geometry of the catalog entry', () => {
    expect(bodyOf('auto_approve_submissions')).toMatch(/public\.same_geometry\(s\.spec, v_spec\);/);
  });

  it('should fire after an insert or a change of the numbers, not after the owner changes the status (no loop)', () => {
    expect(sql).toMatch(/after insert or update of spec on public\.bike_submissions/);
  });

  it('should keep the trigger function away from every role', () => {
    expect(sql).toContain('revoke all on function public.auto_approve_submissions() from public, anon, authenticated;');
    expect(sql).not.toMatch(/grant execute on function public\.auto_approve_submissions/);
  });

  it('should keep the misses private: only an admin reads them, nobody writes them directly, and no account or address is stored', () => {
    expect(sql).toContain('alter table public.bike_misses enable row level security');
    expect(sql).toMatch(/on public\.bike_misses\s+for select to authenticated using \(public\.is_admin\(\)\)/);
    expect(sql).not.toMatch(/on public\.bike_misses\s+for (insert|update|delete)/);
    const table = sql.slice(sql.indexOf('create table public.bike_misses'), sql.indexOf(');', sql.indexOf('create table public.bike_misses')));
    expect(table).not.toMatch(/user_id|ip|email/);
  });

  it('should let anyone report a miss but only after checking the text, the year and the size of the table', () => {
    const body = bodyOf('record_bike_miss');
    expect(body).toContain('not between 1 and 60');
    expect(body).toContain("!~ '^[[:alnum:] .,/+()''-]+$'");
    expect(body).toContain('>= 5000');
    expect(body).toMatch(/security definer/);
    expect(sql).toContain('grant execute on function public.record_bike_miss(text, text, integer) to anon, authenticated;');
  });

  it('should let only an admin clear a miss, and give it to nobody else', () => {
    expect(bodyOf('admin_clear_bike_miss')).toMatch(/if not public\.is_admin\(\) then\s+raise exception 'not allowed' using errcode = '42501'/);
    expect(sql).toContain('revoke all on function public.admin_clear_bike_miss(text) from public, anon;');
    expect(sql).not.toMatch(/service_role/i);
  });
});
