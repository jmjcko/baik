import { describe, it, expect, afterEach, vi } from 'vitest';
import { connectOnServer, disconnectOnServer, syncOnServer, toFailure } from '../serverApi';

const ride = { id: 'icu-1', date: '2026-10-20', terrain: 'road', km: 10, elevationM: 5, gearId: null, gearName: null };
const answer = (body: unknown, status = 200) => vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(body), { status })));

describe('the calls to the server of the key in the account', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('should send the key in the body of a POST to the connect route and return the rides', async () => {
    answer({ success: true, rides: [ride] });
    expect(await connectOnServer('me', { athleteId: '0', key: 'abcdefgh12345' }, '2026-10-01', '2026-11-09')).toEqual({ ok: true, rides: [ride] });
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe('/api/intervals/connect');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual({ riderId: 'me', athleteId: '0', key: 'abcdefgh12345', oldest: '2026-10-01', newest: '2026-11-09' });
  });

  it('should send no key to the sync route', async () => {
    answer({ success: true, rides: [] });
    await syncOnServer('me', '2026-10-01', '2026-11-09');
    expect(JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body))).toEqual({ riderId: 'me', oldest: '2026-10-01', newest: '2026-11-09' });
  });

  it('should drop anything in the answer that is not a ride', async () => {
    answer({ success: true, rides: [ride, { id: 5 }, null, 'x'] });
    expect(await syncOnServer('me', '2026-10-01', '2026-11-09')).toEqual({ ok: true, rides: [ride] });
  });

  it.each([
    ['not_configured', 'not_configured'],
    ['unauthorized', 'not_signed_in'],
    ['not_connected', 'not_connected'],
    ['key_rejected', 'unauthorized'],
    ['rate_limited', 'rate_limited'],
    ['invalid_input', 'invalid_input'],
    ['something else', 'unavailable'],
  ])('should read the server code %s as %s', async (code, expected) => {
    answer({ success: false, error: code }, 400);
    expect(await syncOnServer('me', '2026-10-01', '2026-11-09')).toEqual({ ok: false, error: expected });
  });

  it('should report a network failure or a damaged answer as unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('down'); }));
    expect(await syncOnServer('me', 'a', 'b')).toEqual({ ok: false, error: 'unavailable' });
    vi.stubGlobal('fetch', vi.fn(async () => new Response('<html>', { status: 502 })));
    expect(await connectOnServer('me', { athleteId: '0', key: 'abcdefgh12345' }, 'a', 'b')).toEqual({ ok: false, error: 'unavailable' });
  });

  it('should say whether the stored key is gone', async () => {
    answer({ success: true });
    expect(await disconnectOnServer('me')).toBe(true);
    answer({ success: false });
    expect(await disconnectOnServer('me')).toBe(false);
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('down'); }));
    expect(await disconnectOnServer('me')).toBe(false);
  });

  it('should turn a failure of the server into one that the cards have a text for', () => {
    expect(toFailure('not_connected')).toBe('unauthorized');
    expect(toFailure('not_configured')).toBe('unavailable');
    expect(toFailure('not_signed_in')).toBe('unavailable');
    expect(toFailure('rate_limited')).toBe('rate_limited');
  });
});
