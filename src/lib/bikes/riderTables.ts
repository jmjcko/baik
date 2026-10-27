import { createRateLimiter } from '@/lib/security/rateLimit';
import { validBikeName } from './adminExtraction';
import { IMAGE_MIME_TYPES, MAX_IMAGE_BASE64_LENGTH } from './extraction';
import type { TableFile } from './tableExtraction';

const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;
export const RIDER_MAX_FILES = 4;

/** A picture that the browser has shrunk and re-encoded (see `prepareGeometryImage`). */
export interface RiderPicture {
  imageBase64: string;
  mimeType: string;
}

export interface RiderTableInput {
  images: RiderPicture[];
  /** The bike, as the rider typed it. */
  name: string;
}

/**
 * A rider's reading of the tables of one bike: one to four pictures (JPEG, PNG or WebP, each of a bounded size) and a plain bike
 * name. Riders send pictures only (no PDF); the owner's upload route has its own, wider check.
 */
export function validateRiderTables(input: unknown): input is RiderTableInput {
  const { images, name } = (input ?? {}) as Partial<RiderTableInput>;
  return (
    Array.isArray(images) && images.length >= 1 && images.length <= RIDER_MAX_FILES && typeof name === 'string' && validBikeName(name) &&
    images.every((image) => typeof image?.imageBase64 === 'string' && image.imageBase64.length > 100 && image.imageBase64.length <= MAX_IMAGE_BASE64_LENGTH && BASE64.test(image.imageBase64) && (IMAGE_MIME_TYPES as readonly unknown[]).includes(image.mimeType))
  );
}

export const toTableFiles = (images: RiderPicture[]): TableFile[] => images.map((image) => ({ data: image.imageBase64, mimeType: image.mimeType }));

/** Reading a table costs money: three candidates, a second try each and a correction, at most 12 readings per hour per caller. */
export const RIDER_TABLE_LIMIT = { max: 12, windowMs: 60 * 60 * 1000 };
export const riderTableLimiter = createRateLimiter(RIDER_TABLE_LIMIT);
