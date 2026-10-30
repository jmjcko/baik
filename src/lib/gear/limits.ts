import { createRateLimiter } from '@/lib/security/rateLimit';

/** "Find the parameters of a product" calls Gemini, which costs money: at most 20 calls per hour per caller. */
export const RESEARCH_LIMIT = { max: 20, windowMs: 60 * 60 * 1000 };
export const researchLimiter = createRateLimiter(RESEARCH_LIMIT);
