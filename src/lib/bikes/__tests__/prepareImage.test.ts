import { describe, it, expect, vi, afterEach } from 'vitest';
import { JPEG_QUALITIES, MAX_INPUT_BYTES, MAX_SIDE_PX, canUseFile, firstWithin, fitWithin, prepareGeometryImage } from '../prepareImage';

const file = (type: string, size = 1000) => ({ type, size }) as File;

describe('fitWithin', () => {
  it('should shrink the longer side to the limit and keep the proportions', () => {
    expect(fitWithin(3200, 2400, 1600)).toEqual({ width: 1600, height: 1200 });
    expect(fitWithin(2400, 3200, 1600)).toEqual({ width: 1200, height: 1600 });
  });

  it('should not enlarge a small picture, and never return a side of zero', () => {
    expect(fitWithin(800, 600, 1600)).toEqual({ width: 800, height: 600 });
    expect(fitWithin(10000, 1, 1600)).toEqual({ width: 1600, height: 1 });
  });
});

describe('firstWithin', () => {
  it('should return the first encoding that is short enough and stop trying', async () => {
    const encode = vi.fn(async (quality: number) => 'x'.repeat(Math.round(quality * 100)));
    expect(await firstWithin(60, [0.85, 0.72, 0.6, 0.5], encode)).toBe('x'.repeat(60));
    expect(encode.mock.calls.map(([q]) => q)).toEqual([0.85, 0.72, 0.6]);
  });

  it('should give up with null when even the last encoding is too long', async () => {
    expect(await firstWithin(10, [0.8, 0.4], async () => 'x'.repeat(50))).toBeNull();
  });
});

describe('canUseFile', () => {
  it('should accept JPEG, PNG and WebP up to the size limit only', () => {
    for (const type of ['image/jpeg', 'image/png', 'image/webp']) expect(canUseFile(file(type))).toBe(true);
    expect(canUseFile(file('image/jpeg', MAX_INPUT_BYTES))).toBe(true);
    expect(canUseFile(file('image/jpeg', MAX_INPUT_BYTES + 1))).toBe(false);
    expect(canUseFile(file('image/jpeg', 0))).toBe(false);
    for (const type of ['application/pdf', 'image/svg+xml', 'image/gif', 'text/html', '']) expect(canUseFile(file(type))).toBe(false);
  });
});

describe('prepareGeometryImage', () => {
  afterEach(() => vi.restoreAllMocks());

  it('should refuse a file that cannot be used without touching it', async () => {
    expect(await prepareGeometryImage(file('application/pdf'), 1000)).toBeNull();
  });

  it('should draw the picture on a white canvas at most 1600 px wide and give a JPEG in base64', async () => {
    const drawn: Array<[number, number]> = [];
    const context = { fillStyle: '', fillRect: vi.fn(), drawImage: vi.fn((_bitmap: unknown, _x: number, _y: number, w: number, h: number) => drawn.push([w, h])) };
    vi.stubGlobal('createImageBitmap', async () => ({ width: 3200, height: 2400, close: vi.fn() }));
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
    const qualities: number[] = [];
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback, _type, quality) => {
      qualities.push(quality as number);
      callback(new Blob([new Uint8Array([255, 216, 255, 224])], { type: 'image/jpeg' }));
    });
    const result = await prepareGeometryImage(new File(['x'], 'chart.png', { type: 'image/png' }), 1000);
    expect(result).toEqual({ imageBase64: btoa(String.fromCharCode(255, 216, 255, 224)), mimeType: 'image/jpeg' });
    expect(drawn).toEqual([[MAX_SIDE_PX, 1200]]);
    expect(context.fillStyle).toBe('#ffffff');
    expect(qualities).toEqual([JPEG_QUALITIES[0]]);
  });

  it('should lower the quality until the picture is short enough, and say null when it never is', async () => {
    const context = { fillStyle: '', fillRect: vi.fn(), drawImage: vi.fn() };
    vi.stubGlobal('createImageBitmap', async () => ({ width: 800, height: 600, close: vi.fn() }));
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
    const qualities: number[] = [];
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback, _type, quality) => {
      qualities.push(quality as number);
      callback(new Blob([new Uint8Array(Math.round((quality as number) * 100))]));
    });
    const input = new File(['x'], 'chart.jpg', { type: 'image/jpeg' });
    expect((await prepareGeometryImage(input, 100))?.imageBase64.length).toBeGreaterThan(0);
    expect(qualities.length).toBeGreaterThan(1);
    expect(await prepareGeometryImage(input, 4)).toBeNull();
  });

  it('should say null when the picture cannot be decoded or there is no canvas', async () => {
    vi.stubGlobal('createImageBitmap', async () => { throw new Error('bad image'); });
    expect(await prepareGeometryImage(new File(['x'], 'a.png', { type: 'image/png' }), 1000)).toBeNull();
    vi.stubGlobal('createImageBitmap', async () => ({ width: 10, height: 10, close: vi.fn() }));
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    expect(await prepareGeometryImage(new File(['x'], 'a.png', { type: 'image/png' }), 1000)).toBeNull();
  });
});
