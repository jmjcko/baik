// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { adminLimiter } from '@/lib/bikes/adminExtraction';

const rpc = vi.fn();
const getUser = vi.fn();
let client: unknown = { auth: { getUser }, rpc };
vi.mock('@/lib/supabase/server', () => ({ createSupabaseServerClient: async () => client }));
const writeSeedEntry = vi.fn();
vi.mock('@/lib/catalog/seedFile', () => ({ writeSeedEntry: (entry: unknown) => writeSeedEntry(entry) }));

import { POST } from '../route';

const post = (body: string) => new Request('http://localhost/api/admin/seed-bikes', { method: 'POST', body });
const ENTRY = JSON.stringify({ entry: { id: 'cube-attain-2025' } });

describe('POST /api/admin/seed-bikes', () => {
  beforeEach(() => {
    rpc.mockReset().mockResolvedValue({ data: true });
    getUser.mockReset().mockResolvedValue({ data: { user: { id: 'admin-1' } } });
    client = { auth: { getUser }, rpc };
    writeSeedEntry.mockReset().mockResolvedValue({ ok: true });
    adminLimiter.reset();
    vi.stubEnv('NODE_ENV', 'development');
  });
  afterEach(() => vi.unstubAllEnvs());

  it('should write the entry for an admin on the development server', async () => {
    const response = await POST(post(ENTRY));
    expect(response.status).toBe(200);
    expect(writeSeedEntry).toHaveBeenCalledWith({ id: 'cube-attain-2025' });
  });

  it('should be off in production, before anything else is asked', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const response = await POST(post(ENTRY));
    expect(response.status).toBe(403);
    expect(getUser).not.toHaveBeenCalled();
    expect(writeSeedEntry).not.toHaveBeenCalled();
  });

  it('should refuse a guest and a signed in user who is not an admin', async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    expect((await POST(post(ENTRY))).status).toBe(403);
    getUser.mockResolvedValue({ data: { user: { id: 'u2' } } });
    rpc.mockResolvedValue({ data: false });
    expect((await POST(post(ENTRY))).status).toBe(403);
    expect(writeSeedEntry).not.toHaveBeenCalled();
  });

  it('should refuse a body that is empty, too large or not JSON', async () => {
    expect((await POST(post(''))).status).toBe(413);
    expect((await POST(post('x'.repeat(200_001)))).status).toBe(413);
    expect((await POST(post('{nope'))).status).toBe(400);
    expect(writeSeedEntry).not.toHaveBeenCalled();
  });

  it('should answer 400 for an entry the seed loader refuses and 500 when the file cannot be written', async () => {
    writeSeedEntry.mockResolvedValueOnce({ ok: false, reason: 'invalid' });
    expect((await POST(post(ENTRY))).status).toBe(400);
    writeSeedEntry.mockResolvedValueOnce({ ok: false, reason: 'unreadable' });
    expect((await POST(post(ENTRY))).status).toBe(500);
  });
});
