import { createRateLimiter } from '@/lib/security/rateLimit';

/** "Load my bike from a link" calls Gemini, which costs money: at most 8 calls per hour per caller. */
export const EXTRACTION_LIMIT = { max: 8, windowMs: 60 * 60 * 1000 };

export const extractionLimiter = createRateLimiter(EXTRACTION_LIMIT);
