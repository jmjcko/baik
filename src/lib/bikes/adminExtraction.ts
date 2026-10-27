import { createRateLimiter } from '@/lib/security/rateLimit';
import { IMAGE_MIME_TYPES } from './extraction';

/** The owner may also read a PDF catalog; images and PDFs, together up to 10 MB. */
export const ADMIN_MIME_TYPES: readonly string[] = [...IMAGE_MIME_TYPES, 'application/pdf'];
export const ADMIN_MAX_BYTES = 10 * 1024 * 1024;
export const ADMIN_MAX_FILES = 4;
const MAX_NAME = 80;
const NAME_PATTERN = /^[\p{L}\p{N} .,/+()'-]+$/u;

export interface AdminTables {
  files: Array<{ type: string; bytes: number }>;
  name: string;
}

/** A bike name that is plain text (letters, digits and a few marks), at most 80 characters. */
export const validBikeName = (name: string): boolean => name.trim().length >= 1 && name.length <= MAX_NAME && NAME_PATTERN.test(name);

/** The owner's upload: one to four files of an allowed type, together up to 10 MB, and a plain bike name; anything else is refused. */
export function validateAdminTables({ files, name }: AdminTables): boolean {
  const total = files.reduce((sum, file) => sum + file.bytes, 0);
  return (
    files.length >= 1 && files.length <= ADMIN_MAX_FILES && total <= ADMIN_MAX_BYTES &&
    files.every((file) => ADMIN_MIME_TYPES.includes(file.type) && file.bytes > 0) &&
    validBikeName(name)
  );
}

/** The owner reads many tables in a row, so the hourly limit is much higher than for riders. */
export const ADMIN_LIMIT = { max: 60, windowMs: 60 * 60 * 1000 };
export const adminLimiter = createRateLimiter(ADMIN_LIMIT);
