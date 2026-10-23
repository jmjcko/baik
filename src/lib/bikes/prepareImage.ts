/**
 * Prepares a picture of a geometry table in the browser before it is sent to be read: shrunk, drawn on a white canvas
 * and encoded again as a JPEG, so that the file is small enough for the server and every bit of hidden data (location,
 * camera, a person in the background) is gone. The picture is used once and is never stored.
 */
export const MAX_INPUT_BYTES = 15 * 1024 * 1024;
export const MAX_SIDE_PX = 1600;
export const JPEG_QUALITIES = [0.85, 0.72, 0.6, 0.5, 0.4];
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

export interface PreparedImage {
  imageBase64: string;
  mimeType: 'image/jpeg';
}

/** The size that fits into `max` pixels on the longer side, keeping the proportions; a smaller picture is not enlarged. */
export function fitWithin(width: number, height: number, max: number): { width: number; height: number } {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

/** The first encoding (best quality first) that is not longer than `limit`, or null when even the last one is too long. */
export async function firstWithin(limit: number, qualities: number[], encode: (quality: number) => Promise<string>): Promise<string | null> {
  for (const quality of qualities) {
    const data = await encode(quality);
    if (data.length <= limit) return data;
  }
  return null;
}

export function canUseFile(file: Pick<File, 'type' | 'size'>): boolean {
  return ACCEPTED.includes(file.type) && file.size > 0 && file.size <= MAX_INPUT_BYTES;
}

function base64Of(bytes: Uint8Array): string {
  let binary = '';
  for (let start = 0; start < bytes.length; start += 0x8000) binary += String.fromCharCode(...bytes.subarray(start, start + 0x8000));
  return btoa(binary);
}

async function drawOnWhite(file: File): Promise<HTMLCanvasElement> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = fitWithin(bitmap.width, bitmap.height, MAX_SIDE_PX);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('no canvas');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas;
}

const toJpeg = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));

/** The picture ready to send (a JPEG of at most `limit` base64 characters), or null when the file cannot be used. */
export async function prepareGeometryImage(file: File, limit: number): Promise<PreparedImage | null> {
  if (!canUseFile(file)) return null;
  try {
    const canvas = await drawOnWhite(file);
    const encode = async (quality: number) => {
      const blob = await toJpeg(canvas, quality);
      return blob ? base64Of(new Uint8Array(await blob.arrayBuffer())) : '';
    };
    const imageBase64 = await firstWithin(limit, JPEG_QUALITIES, encode);
    return imageBase64 ? { imageBase64, mimeType: 'image/jpeg' } : null;
  } catch {
    return null;
  }
}
