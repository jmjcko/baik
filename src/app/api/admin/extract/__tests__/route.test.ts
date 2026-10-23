// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { STOCK_BIKE_SPECS } from '@/lib/bikes';
import { ADMIN_LIMIT, adminLimiter } from '@/lib/bikes/adminExtraction';

const rpc = vi.fn();
const getUser = vi.fn();
let client: unknown = { auth: { getUser }, rpc };
vi.mock('@/lib/supabase/server', () => ({ createSupabaseServerClient: async () => client }));

import { POST } from '../route';

const M = STOCK_BIKE_SPECS[0].sizes.M;
const answer = (text: string) => ({ ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] }) }) as unknown as Response;
const size = (label: string, over = {}) => ({ size: label, frameStackMm: M.frameStackMm, frameReachMm: M.frameReachMm, seatTubeAngleDeg: M.seatTubeAngleDeg, stockStemMm: 100, ...over });
const reading = JSON.stringify({ sizes: [size('47 cm'), size('50 cm', { frameStackMm: 538 })] });

function request(files: Array<File | null>, name = 'Cube Attain 2027') {
  const form = new FormData();
  for (const file of files) if (file) form.append('files', file);
  form.append('name', name);
  return new Request('http://localhost/api/admin/extract', { method: 'POST', body: form });
}
const pdf = (bytes = 2000) => new File([new Uint8Array(bytes)], 'catalog.pdf', { type: 'application/pdf' });
const png = (bytes = 2000) => new File([new Uint8Array(bytes)], 'table.png', { type: 'image/png' });

describe('POST /api/admin/extract', () => {
  beforeEach(() => {
    rpc.mockReset().mockResolvedValue({ data: true });
    getUser.mockReset().mockResolvedValue({ data: { user: { id: 'admin-1' } } });
    client = { auth: { getUser }, rpc };
    adminLimiter.reset();
    vi.stubEnv('GEMINI_API_KEY', 'secret-key');
    vi.stubGlobal('fetch', vi.fn(async () => answer(reading)));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('should read two files for an admin at once and answer with every size', async () => {
    const response = await POST(request([png(), pdf()]));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.table.sizes.map((item: { size: string }) => item.size)).toEqual(['47', '50']);
    expect(body.table.skipped).toBe(0);
    expect(fetch).toHaveBeenCalledTimes(1);
    const [, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    const sent = JSON.parse(init.body as string);
    expect(sent.contents[0].parts.map((part: { inline_data?: { mime_type: string } }) => part.inline_data?.mime_type)).toEqual([undefined, 'image/png', 'application/pdf']);
    expect(sent.contents[0].parts[0].text).toContain('Bike: Cube Attain 2027');
    expect(sent.system_instruction.parts[0].text).toContain('ONE bicycle');
    expect(init.body as string).not.toContain('secret-key');
  });

  it('should ask the database whether the user is an admin, and refuse a user who is not (nothing is sent to Gemini)', async () => {
    rpc.mockResolvedValue({ data: false });
    const response = await POST(request([pdf()]));
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ success: false, error: 'forbidden' });
    expect(rpc).toHaveBeenCalledWith('is_admin');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should refuse a guest, and a failed or missing admin answer', async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    expect((await POST(request([pdf()]))).status).toBe(403);
    getUser.mockResolvedValue({ data: { user: { id: 'u' } } });
    rpc.mockResolvedValue({ data: null, error: { code: '42883' } });
    expect((await POST(request([pdf()]))).status).toBe(403);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should say not configured without Supabase or without the key', async () => {
    client = null;
    const noSupabase = await POST(request([pdf()]));
    expect([noSupabase.status, (await noSupabase.json()).error]).toEqual([503, 'not_configured']);
    client = { auth: { getUser }, rpc };
    vi.stubEnv('GEMINI_API_KEY', '');
    const noKey = await POST(request([pdf()]));
    expect([noKey.status, (await noKey.json()).error]).toEqual([503, 'not_configured']);
  });

  it.each([
    ['no file', [] as File[], 'Cube Attain 2027'],
    ['an SVG', [new File(['<svg/>'], 'a.svg', { type: 'image/svg+xml' })], 'Cube Attain 2027'],
    ['files over 10 MB together', [pdf(6 * 1024 * 1024), pdf(5 * 1024 * 1024)], 'Cube Attain 2027'],
    ['five files', [pdf(), pdf(), pdf(), pdf(), pdf()], 'Cube Attain 2027'],
    ['no name', [pdf()], ' '],
    ['a name with markup', [pdf()], '<script>'],
  ])('should refuse %s with a fixed code and send nothing', async (_name, files, name) => {
    const response = await POST(request(files, name));
    expect([response.status, (await response.json()).error]).toEqual([400, 'invalid_input']);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should refuse a body that is not a form', async () => {
    const response = await POST(new Request('http://localhost/api/admin/extract', { method: 'POST', body: 'plain text' }));
    expect(response.status).toBe(400);
  });

  it('should limit the admin to 60 readings per hour', async () => {
    expect(ADMIN_LIMIT.max).toBe(60);
    for (let call = 0; call < 60; call++) expect((await POST(request([pdf()]))).status).toBe(200);
    const refused = await POST(request([pdf()]));
    expect([refused.status, (await refused.json()).error]).toEqual([429, 'rate_limited']);
  });

  it('should answer unreadable for a file without geometry and unavailable when the service fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => answer('{"error": "not_found"}')));
    const unreadable = await POST(request([pdf()]));
    expect([unreadable.status, (await unreadable.json()).error]).toEqual([422, 'unreadable']);
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 400, json: async () => ({}) }) as unknown as Response));
    const unavailable = await POST(request([pdf()]));
    expect([unavailable.status, (await unavailable.json()).error]).toEqual([502, 'unavailable']);
  });
});
