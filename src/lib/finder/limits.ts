import { createRateLimiter } from '@/lib/security/rateLimit';

/** "Suggest three bikes" calls Gemini, which costs money: at most 6 calls per hour per caller. */
export const RECOMMEND_LIMIT = { max: 6, windowMs: 60 * 60 * 1000 };
export const recommendLimiter = createRateLimiter(RECOMMEND_LIMIT);
