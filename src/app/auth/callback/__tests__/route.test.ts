import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const exchangeCodeForSession = vi.fn();
const verifyOtp = vi.fn();
let client: unknown = { auth: { exchangeCodeForSession, verifyOtp } };

vi.mock('@/lib/supabase/server', () => ({ createSupabaseServerClient: async () => client }));

const call = async (query: string) => {
  const { GET } = await import('../route');
  const response = await GET(new NextRequest(`http://localhost:3001/auth/callback${query}`));
  return { response, location: new URL(response.headers.get('location') ?? 'http://none') };
};

beforeEach(() => {
  exchangeCodeForSession.mockReset().mockResolvedValue({ error: null });
  verifyOtp.mockReset().mockResolvedValue({ error: null });
  client = { auth: { exchangeCodeForSession, verifyOtp } };
});

describe('/auth/callback', () => {
  it('should exchange the code, then return to the app with the ok flag', async () => {
    const { response, location } = await call('?code=abc123');
    expect(exchangeCodeForSession).toHaveBeenCalledWith('abc123');
    expect(response.status).toBe(307);
    expect(`${location.origin}${location.pathname}`).toBe('http://localhost:3001/');
    expect(location.searchParams.get('auth')).toBe('ok');
  });

  it('should continue to a path inside the app when one is given', async () => {
    const { location } = await call('?code=abc&next=/report');
    expect(location.pathname).toBe('/report');
  });

  it.each(['https://evil.example/', '//evil.example', '/\\evil.example', 'javascript:alert(1)', 'evil', '/%0d%0aSet-Cookie:x=1'])(
    'should not follow the unsafe next value %j out of the app',
    async (next) => {
      const { location } = await call(`?code=abc&next=${encodeURIComponent(next)}`);
      expect(location.origin).toBe('http://localhost:3001');
      expect(location.pathname).toBe('/');
    }
  );

  it('should verify the token hash of an e-mail link', async () => {
    const { location } = await call('?token_hash=hash1&type=magiclink');
    expect(verifyOtp).toHaveBeenCalledWith({ type: 'magiclink', token_hash: 'hash1' });
    expect(location.searchParams.get('auth')).toBe('ok');
  });

  it('should refuse an unknown link type or a call without any code', async () => {
    expect((await call('?token_hash=hash1&type=evil')).location.searchParams.get('auth')).toBe('error');
    expect((await call('')).location.searchParams.get('auth')).toBe('error');
    expect(verifyOtp).not.toHaveBeenCalled();
  });

  it('should report only a fixed error flag when the service refuses the code or fails', async () => {
    exchangeCodeForSession.mockResolvedValueOnce({ error: { message: 'secret detail about rider@example.com' } });
    const refused = await call('?code=bad');
    expect(refused.location.searchParams.get('auth')).toBe('error');
    expect(refused.location.search).not.toContain('secret');
    exchangeCodeForSession.mockRejectedValueOnce(new Error('network'));
    expect((await call('?code=abc')).location.searchParams.get('auth')).toBe('error');
  });

  it('should return to the app with the error flag when Supabase is not configured', async () => {
    client = null;
    expect((await call('?code=abc')).location.searchParams.get('auth')).toBe('error');
  });

  describe('the server log of a failed return', () => {
    const lines = () => (console.error as unknown as ReturnType<typeof vi.fn>).mock.calls.map((args) => JSON.parse(String(args[1])));
    beforeEach(() => void vi.spyOn(console, 'error').mockImplementation(() => undefined));

    it('should log the stage and the error code when the code is refused, and never the message or the code itself', async () => {
      exchangeCodeForSession.mockResolvedValueOnce({ error: { code: 'bad_code_verifier', status: 400, name: 'AuthApiError', message: 'secret detail about rider@example.com' } });
      await call('?code=super-secret-code');
      expect(lines()).toEqual([{ stage: 'exchange_failed', code: 'bad_code_verifier', status: '400', name: 'AuthApiError' }]);
      expect(JSON.stringify((console.error as unknown as ReturnType<typeof vi.fn>).mock.calls)).not.toMatch(/secret|rider@example/);
    });

    it('should log a refusal of the provider with its error code and a missing code on its own', async () => {
      await call('?error=server_error&error_code=unexpected_failure&error_description=Hidden+words');
      await call('');
      expect(lines()).toEqual([{ stage: 'provider_error', code: 'unexpected_failure' }, { stage: 'no_code' }]);
    });

    it('should log a missing configuration and an exception, and say nothing when the sign in works', async () => {
      client = null;
      await call('?code=abc');
      client = { auth: { exchangeCodeForSession: async () => { throw Object.assign(new Error('boom'), { name: 'TypeError' }); }, verifyOtp } };
      await call('?code=abc');
      expect(lines()).toEqual([{ stage: 'no_config' }, { stage: 'exception', name: 'TypeError' }]);
      vi.mocked(console.error).mockClear();
      client = { auth: { exchangeCodeForSession, verifyOtp } };
      await call('?code=ok');
      expect(console.error).not.toHaveBeenCalled();
    });
  });
});
