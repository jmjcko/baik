import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CONSENT_PURPOSES, CONSENT_TEXT_VERSION } from '../purposes';
import { decide, mergeConsents, parseConsents, stateOf, type ConsentMap } from '../consentStore';
import { fetchRemoteConsents, saveRemoteConsents, type ConsentDatabase } from '../consentRemote';

const at = (iso: string) => new Date(iso);

describe('the consent decisions of a rider', () => {
  it('should ask again for a purpose that has no decision or a decision for an older text', () => {
    expect(stateOf({}, 'ai_processing')).toBe('unknown');
    const old: ConsentMap = { ai_processing: { granted: true, version: CONSENT_TEXT_VERSION.ai_processing + 1, decidedAt: '2026-11-09T10:00:00.000Z' } };
    expect(stateOf(old, 'ai_processing')).toBe('unknown');
  });

  it('should keep agreed and declined apart and stamp the version and the time', () => {
    const map = decide(decide({}, 'ai_processing', true, at('2026-11-09T10:00:00Z')), 'strava', false, at('2026-11-09T11:00:00Z'));
    expect(stateOf(map, 'ai_processing')).toBe('granted');
    expect(stateOf(map, 'strava')).toBe('declined');
    expect(map.ai_processing).toEqual({ granted: true, version: CONSENT_TEXT_VERSION.ai_processing, decidedAt: '2026-11-09T10:00:00.000Z' });
  });

  it('should withdraw by deciding again, and the withdrawal is the newer decision', () => {
    const agreed = decide({}, 'health_storage', true, at('2026-11-09T10:00:00Z'));
    const withdrawn = decide(agreed, 'health_storage', false, at('2026-11-09T12:00:00Z'));
    expect(stateOf(withdrawn, 'health_storage')).toBe('declined');
  });

  it('should read stored text defensively and ignore what is not a known decision', () => {
    expect(parseConsents(null)).toEqual({});
    expect(parseConsents('not json')).toEqual({});
    expect(parseConsents('[]')).toEqual({});
    const stored = JSON.stringify({
      ai_processing: { granted: true, version: 1, decidedAt: '2026-11-09T10:00:00.000Z' },
      unknown_purpose: { granted: true, version: 1, decidedAt: '2026-11-09T10:00:00.000Z' },
      strava: { granted: 'yes', version: 1, decidedAt: '2026-11-09T10:00:00.000Z' },
      intervals: { granted: true, version: 0, decidedAt: '2026-11-09T10:00:00.000Z' },
      analytics: { granted: true, version: 1, decidedAt: 'yesterday' },
    });
    expect(Object.keys(parseConsents(stored))).toEqual(['ai_processing']);
  });

  it('should let the newer decision win when this browser and the account disagree', () => {
    const local: ConsentMap = { ai_processing: { granted: false, version: 1, decidedAt: '2026-11-09T12:00:00.000Z' }, strava: { granted: true, version: 1, decidedAt: '2026-11-09T09:00:00.000Z' } };
    const remote: ConsentMap = { ai_processing: { granted: true, version: 1, decidedAt: '2026-11-09T10:00:00.000Z' }, intervals: { granted: true, version: 1, decidedAt: '2026-11-09T08:00:00.000Z' } };
    const merged = mergeConsents(local, remote);
    expect(stateOf(merged, 'ai_processing')).toBe('declined');
    expect(stateOf(merged, 'strava')).toBe('granted');
    expect(stateOf(merged, 'intervals')).toBe('granted');
  });
});

describe('the consents in the account', () => {
  const fakeDb = (rows: unknown, error: { message: string } | null = null) => {
    const upserts: unknown[][] = [];
    const db = {
      from: () => ({
        select: () => ({ eq: async () => ({ data: rows, error }) }),
        upsert: async (list: unknown[]) => {
          upserts.push(list);
          return { error };
        },
      }),
    } as unknown as ConsentDatabase;
    return { db, upserts };
  };

  it('should read the rows of the rider and skip rows that are not valid decisions', async () => {
    const { db } = fakeDb([
      { purpose: 'ai_processing', text_version: 1, granted: true, decided_at: '2026-11-09T10:00:00.000Z' },
      { purpose: 'other', text_version: 1, granted: true, decided_at: '2026-11-09T10:00:00.000Z' },
    ]);
    expect(await fetchRemoteConsents(db, 'u1')).toEqual({ ai_processing: { granted: true, version: 1, decidedAt: '2026-11-09T10:00:00.000Z' } });
  });

  it('should report an unreadable answer as null so that stored rows are never overwritten blindly', async () => {
    expect(await fetchRemoteConsents(fakeDb(null, { message: 'x' }).db, 'u1')).toBeNull();
    expect(await fetchRemoteConsents(fakeDb({ not: 'a list' }).db, 'u1')).toBeNull();
  });

  it('should write one row per decision with the id of the rider and nothing else', async () => {
    const { db, upserts } = fakeDb([]);
    const map = decide({}, 'strava', true, at('2026-11-09T10:00:00Z'));
    expect(await saveRemoteConsents(db, 'u1', map)).toBe(true);
    expect(upserts[0]).toEqual([{ user_id: 'u1', purpose: 'strava', text_version: 1, granted: true, decided_at: '2026-11-09T10:00:00.000Z' }]);
  });

  it('should not call the service when there is nothing to write, and report a failing write', async () => {
    const empty = fakeDb([]);
    expect(await saveRemoteConsents(empty.db, 'u1', {})).toBe(true);
    expect(empty.upserts).toHaveLength(0);
    expect(await saveRemoteConsents(fakeDb([], { message: 'x' }).db, 'u1', decide({}, 'strava', true))).toBe(false);
  });
});

describe('the migration of the consents', () => {
  const sql = readFileSync(join(process.cwd(), 'supabase/migrations/20261109000000_consents.sql'), 'utf8');

  it('should name every purpose of the app and nothing else', () => {
    for (const purpose of CONSENT_PURPOSES) expect(sql).toContain(`'${purpose}'`);
  });

  it('should limit every action to the own rows by row level security', () => {
    expect(sql).toContain('enable row level security');
    for (const action of ['select', 'insert', 'update', 'delete']) expect(sql).toMatch(new RegExp(`for ${action} to authenticated`));
    expect(sql).toContain('auth.uid() = user_id');
    expect(sql).not.toMatch(/to anon|to public/);
    expect(sql).toContain('on delete cascade');
  });
});
