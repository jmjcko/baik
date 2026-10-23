import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const sql = readFileSync('supabase/migrations/20261026000000_app_accounts.sql', 'utf8');

describe('app_accounts migration (guard)', () => {
  it('should keep one row per account with an admin switch that is off by default', () => {
    expect(sql).toMatch(/user_id uuid primary key references auth\.users \(id\) on delete cascade/);
    expect(sql).toContain('is_admin boolean not null default false');
  });

  it('should let riders neither read nor write the table (RLS on, no policy)', () => {
    expect(sql).toContain('alter table public.app_accounts enable row level security;');
    expect(sql).not.toMatch(/create policy/);
  });

  it('should fill the table for existing accounts, keep the admins of app_admins, and add new accounts by a trigger', () => {
    expect(sql).toMatch(/exists \(select 1 from public\.app_admins a where a\.user_id = u\.id\)/);
    expect(sql).toMatch(/after insert on auth\.users\s+for each row execute function public\.add_app_account\(\)/);
  });

  it('should run the trigger function with a fixed search path and make it uncallable for the app roles', () => {
    expect(sql).toMatch(/function public\.add_app_account\(\)[\s\S]*security definer\s+set search_path = ''/);
    expect(sql).toContain('revoke all on function public.add_app_account() from public, anon, authenticated;');
  });

  it('should answer is_admin() by the caller id, false when there is no row', () => {
    expect(sql).toMatch(/function public\.is_admin\(\)[\s\S]*security definer\s+set search_path = ''/);
    expect(sql).toContain('where user_id = auth.uid()), false)');
    expect(sql).toContain('grant execute on function public.is_admin() to authenticated;');
    expect(sql).not.toMatch(/grant [^;]* to [^;]*\b(anon|public)\b/);
  });

  it('should drop the old table only after the data was copied', () => {
    expect(sql.indexOf('drop table public.app_admins;')).toBeGreaterThan(sql.indexOf('insert into public.app_accounts'));
  });
});
