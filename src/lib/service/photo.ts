import { BOOK_LIMITS } from '@/types/service';

/** About 200 KB of image data is about 270 000 characters of base64. */
export const PHOTO_TARGET_CHARS = 270_000;

const EDGES = [1280, 1024, 800, 640, 480] as const;
const QUALITIES = [0.85, 0.7, 0.55, 0.4] as const;

/** The size of a picture whose longer edge is at most `edge`; a smaller picture keeps its size. */
export function scaledSize(width: number, height: number, edge: number): { width: number; height: number } {
  const scale = Math.min(1, edge / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

/** The first encoding that fits the target, trying a smaller picture and a lower quality step by step; null when none fits. */
export function encodeWithin(encode: (edge: number, quality: number) => string | null, limit: number = Math.min(PHOTO_TARGET_CHARS, BOOK_LIMITS.photoChars)): string | null {
  for (const edge of EDGES) {
    for (const quality of QUALITIES) {
      const data = encode(edge, quality);
      if (data !== null && data.length <= limit) return data;
    }
  }
  return null;
}

function load(file: File): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    image.src = url;
  });
}

/** Shrinks a picture chosen by the rider to a JPEG of about 200 KB in the browser (nothing is uploaded); null when it cannot be read. */
export async function shrinkPhoto(file: File): Promise<string | null> {
  if (!file.type.startsWith('image/')) return null;
  const image = await load(file);
  if (!image) return null;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return null;
  return encodeWithin((edge, quality) => {
    const size = scaledSize(image.naturalWidth, image.naturalHeight, edge);
    canvas.width = size.width;
    canvas.height = size.height;
    context.drawImage(image, 0, 0, size.width, size.height);
    return canvas.toDataURL('image/jpeg', quality);
  });
}
