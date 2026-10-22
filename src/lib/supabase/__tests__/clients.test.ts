import { describe, it, expect, vi, beforeEach } from 'vitest';

const createBrowserClient = vi.fn(() => ({ kind: 'browser' }));
const createServerClient = vi.fn<(url: string, key: string, options: unknown) => object>(() => ({ kind: 'server' }));
const cookieStore = { getAll: vi.fn(() => [{ name: 'a', value: '1' }]), set: vi.fn() };

vi.mock('@supabase/ssr', () => ({ createBrowserClient, createServerClient }));
vi.mock('next/headers', () => ({ cookies: async () => cookieStore }));

const config = { url: 'https://abcd1234.supabase.co', anonKey: 'sb_publishable_abcdefghijklmnop' };

describe('browser client', () => {
  beforeEach(async () => {
    createBrowserClient.mockClear();
    (await import('../client')).resetBrowserClient();
  });

  it('should be null without a configuration and create nothing', async () => {
    const { getBrowserClient } = await import('../client');
    expect(getBrowserClient(null)).toBeNull();
    expect(createBrowserClient).not.toHaveBeenCalled();
  });

  it('should create one client with the public url and key only and reuse it', async () => {
    const { getBrowserClient } = await import('../client');
    const first = getBrowserClient(config);
    expect(getBrowserClient(config)).toBe(first);
    expect(createBrowserClient).toHaveBeenCalledTimes(1);
    expect(createBrowserClient).toHaveBeenCalledWith(config.url, config.anonKey);
  });
});

describe('server client', () => {
  beforeEach(() => {
    createServerClient.mockClear();
    cookieStore.set.mockClear();
  });

  it('should be null without a configuration', async () => {
    const { createSupabaseServerClient } = await import('../server');
    expect(await createSupabaseServerClient(null)).toBeNull();
    expect(createServerClient).not.toHaveBeenCalled();
  });

  it('should read and write the cookies of the request and survive a read-only cookie store', async () => {
    const { createSupabaseServerClient } = await import('../server');
    await createSupabaseServerClient(config);
    const options = createServerClient.mock.calls[0][2] as { cookies: { getAll: () => unknown; setAll: (list: Array<{ name: string; value: string; options: object }>) => void } };
    expect(options.cookies.getAll()).toEqual([{ name: 'a', value: '1' }]);
    options.cookies.setAll([{ name: 'sb', value: 'x', options: { path: '/' } }]);
    expect(cookieStore.set).toHaveBeenCalledWith('sb', 'x', { path: '/' });
    cookieStore.set.mockImplementation(() => {
      throw new Error('read-only');
    });
    expect(() => options.cookies.setAll([{ name: 'sb', value: 'y', options: {} }])).not.toThrow();
  });
});
