// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { toIntervalsRide, gearsOf } from '../activities';
import { fetchIntervalsRides, INTERVALS_BASE, validAthleteId, validKey } from '../api';
import { mergeIntervalsRides, pairIntervals, unpairIntervals } from '../book';
import { claims, rulesOverlap } from '../rule';
import { parseBook } from '@/lib/service/parseBook';
import { DEFAULT_BOOK } from '@/types/service';

const activity = (over: Record<string, unknown> = {}) => ({ id: 'i101', type: 'GravelRide', distance: 62_400, total_elevation_gain: 780.2, start_date_local: '2026-10-25T07:15:00', gear: { id: 'b1', name: 'Grizl' }, ...over });
const day = (offset: number) => new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10);

describe('an activity of Intervals.icu as a ride', () => {
  it.each([['Ride', 'road'], ['GravelRide', 'gravel'], ['MountainBikeRide', 'mtb'], ['VirtualRide', 'trainer']])('should read %s as %s', (type, terrain) => {
    expect(toIntervalsRide(activity({ type }))?.terrain).toBe(terrain);
  });
  it('should keep only the summary, read the bike and round the numbers', () => {
    const ride = toIntervalsRide(activity({ icu_athlete_id: 'x', name: 'Home loop', start_latlng: [50, 14], polyline: 'abc', trainer: false }));
    expect(ride).toEqual({ id: 'icu-i101', date: '2026-10-25', terrain: 'gravel', km: 62.4, elevationM: 780, gearId: 'b1', gearName: 'Grizl' });
    expect(Object.keys(ride as object).sort()).toEqual(['date', 'elevationM', 'gearId', 'gearName', 'id', 'km', 'terrain']);
  });
  it('should read the trainer flag, a gear id on the activity and a missing bike', () => {
    expect(toIntervalsRide(activity({ type: 'Ride', trainer: true }))?.terrain).toBe('trainer');
    expect(toIntervalsRide(activity({ gear: undefined, gear_id: 'b7' }))).toMatchObject({ gearId: 'b7', gearName: null });
    expect(toIntervalsRide(activity({ gear: undefined }))).toMatchObject({ gearId: null });
  });
  it('should drop e-bikes, other sports, tiny or empty activities and bad ids', () => {
    for (const bad of [activity({ type: 'EBikeRide' }), activity({ type: 'Run' }), activity({ distance: 50 }), activity({ distance: undefined }), activity({ id: '../x' }), activity({ start_date_local: 'soon' }), null, 'x']) expect(toIntervalsRide(bad)).toBeNull();
  });
  it('should list the bikes found on the rides, and none when the data has none', () => {
    const rides = [toIntervalsRide(activity()), toIntervalsRide(activity({ id: 'i2', gear: { id: 'b1', name: 'Grizl' } })), toIntervalsRide(activity({ id: 'i3', gear: { id: 'b2', name: 'Aethos' } }))].filter((r) => r !== null);
    expect(gearsOf(rides)).toEqual([{ id: 'b1', name: 'Grizl' }, { id: 'b2', name: 'Aethos' }]);
    expect(gearsOf([toIntervalsRide(activity({ gear: undefined })) as never])).toEqual([]);
  });
});

describe('the call to Intervals.icu', () => {
  const creds = { athleteId: '0', key: 'abcdefgh12345' };
  it('should check the id and the key', () => {
    expect(['0', 'i12345', '12345'].every(validAthleteId)).toBe(true);
    expect(['', '../x', 'abc'].some(validAthleteId)).toBe(false);
    expect(validKey('abcdefgh12345')).toBe(true);
    expect(['short', 'has space in it', ''].some(validKey)).toBe(false);
  });
  it('should call with basic auth (user API_KEY, the key as the password) and the range of days', async () => {
    let seen: { url: string; auth: string } = { url: '', auth: '' };
    const answer = await fetchIntervalsRides(creds, day(-30), day(0), async (url, init) => { seen = { url, auth: String((init?.headers as Record<string, string>).Authorization) }; return Response.json([activity(), { type: 'Run' }]); });
    expect(answer).toMatchObject({ ok: true, rides: [{ id: 'icu-i101' }] });
    expect(seen.url.startsWith(`${INTERVALS_BASE}/athlete/0/activities?oldest=`)).toBe(true);
    expect(seen.auth).toBe(`Basic ${Buffer.from('API_KEY:abcdefgh12345').toString('base64')}`);
  });
  it.each([[401, 'unauthorized'], [403, 'unauthorized'], [404, 'not_found'], [429, 'rate_limited'], [500, 'unavailable']])('should say %d is %s', async (status, error) => {
    expect(await fetchIntervalsRides(creds, day(-30), day(0), async () => new Response('', { status }))).toEqual({ ok: false, error });
  });
  it('should refuse bad input without calling, and a broken answer', async () => {
    const never = async () => { throw new Error('called'); };
    expect(await fetchIntervalsRides({ athleteId: '../x', key: creds.key }, day(-30), day(0), never)).toEqual({ ok: false, error: 'invalid_input' });
    expect(await fetchIntervalsRides(creds, '2001-01-01', day(0), never)).toEqual({ ok: false, error: 'invalid_input' });
    expect(await fetchIntervalsRides(creds, day(-30), day(0), async () => Response.json({ not: 'a list' }))).toEqual({ ok: false, error: 'unavailable' });
    expect(await fetchIntervalsRides(creds, day(-30), day(0), never)).toEqual({ ok: false, error: 'unavailable' });
  });
});

describe('which rides count for a bike', () => {
  const ride = toIntervalsRide(activity()) as NonNullable<ReturnType<typeof toIntervalsRide>>;
  it('should claim by the bike of Intervals.icu and by the types', () => {
    expect(claims({ gearId: null, types: ['gravel'] }, ride)).toBe(true);
    expect(claims({ gearId: null, types: ['road'] }, ride)).toBe(false);
    expect(claims({ gearId: 'b1', types: [] }, ride)).toBe(true);
    expect(claims({ gearId: 'b2', types: [] }, ride)).toBe(false);
    expect(claims({ gearId: 'b1', types: ['road'] }, ride)).toBe(false);
  });
  it('should find rules that could count the same ride twice', () => {
    expect(rulesOverlap({ gearId: null, types: ['road'] }, { gearId: null, types: ['road', 'gravel'] })).toBe(true);
    expect(rulesOverlap({ gearId: null, types: ['road'] }, { gearId: null, types: ['gravel'] })).toBe(false);
    expect(rulesOverlap({ gearId: 'b1', types: [] }, { gearId: 'b2', types: [] })).toBe(false);
    expect(rulesOverlap({ gearId: 'b1', types: [] }, { gearId: null, types: ['road'] })).toBe(true);
  });
});

describe('the rides of Intervals.icu in the book', () => {
  const rides = [activity(), activity({ id: 'i102', type: 'Ride', start_date_local: '2026-10-20T07:00:00', gear: undefined }), activity({ id: 'i103', start_date_local: '2026-08-01T07:00:00' })].map(toIntervalsRide).filter((r) => r !== null);
  const typed = { id: 'r1', date: '2026-10-01', terrain: 'road' as const, km: 10, elevationM: 0, rain: false };
  const paired = pairIntervals({ ...DEFAULT_BOOK, rides: [typed] }, { gearId: null, gearName: null, types: ['gravel'] }, '2026-09-01');
  it('should load only what the rule claims and from the day, keep what was typed and the rain ticks, and unpair with the rides', () => {
    const first = mergeIntervalsRides(paired, rides, '2026-11-05', 500);
    expect(first.rides.map((r) => r.id)).toEqual(['icu-i101', 'r1']);
    expect(first.intervals?.syncedAt).toBe('2026-11-05');
    const rained = { ...first, rides: first.rides.map((r) => (r.id === 'icu-i101' ? { ...r, rain: true } : r)) };
    expect(mergeIntervalsRides(rained, rides, '2026-11-06', 500).rides.find((r) => r.id === 'icu-i101')?.rain).toBe(true);
    expect(unpairIntervals(first)).toMatchObject({ intervals: null, rides: [typed] });
  });
  it('should drop the loaded rides when the rule changes and do nothing without a rule', () => {
    const first = mergeIntervalsRides(paired, rides, '2026-11-05', 500);
    expect(pairIntervals(first, { gearId: null, gearName: null, types: ['road'] }, '2026-09-01').rides.map((r) => r.id)).toEqual(['r1']);
    expect(mergeIntervalsRides(DEFAULT_BOOK, rides, '2026-11-05', 500)).toBe(DEFAULT_BOOK);
  });
  it('should keep a valid rule when the book is read and drop a bad one', () => {
    expect(parseBook({ intervals: { gearId: 'b1', gearName: 'Grizl', types: ['road', 'boat'], since: '2026-09-01', syncedAt: null } }).intervals).toEqual({ gearId: 'b1', gearName: 'Grizl', types: ['road'], since: '2026-09-01', syncedAt: null });
    for (const bad of [{ gearId: null, types: [], since: '2026-09-01' }, { gearId: '../x', types: [], since: '2026-09-01' }, { gearId: 'b1', types: [], since: 'soon' }, 'x', null]) expect(parseBook({ intervals: bad }).intervals).toBeNull();
  });
});
