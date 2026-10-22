/** What the UI may say about a failed sign in or sign up: fixed codes, never the raw message of the service. */
export type AuthErrorCode =
  | 'invalid_credentials'
  | 'email_not_confirmed'
  | 'weak_password'
  | 'rate_limited'
  | 'network'
  | 'not_configured'
  | 'invalid_input'
  | 'unknown';

interface ServiceError {
  code?: string;
  status?: number;
  name?: string;
}

const BY_CODE: Record<string, AuthErrorCode> = {
  invalid_credentials: 'invalid_credentials',
  email_not_confirmed: 'email_not_confirmed',
  weak_password: 'weak_password',
  over_request_rate_limit: 'rate_limited',
  over_email_send_rate_limit: 'rate_limited',
  over_sms_send_rate_limit: 'rate_limited',
};

/**
 * Maps an error of the auth service to a code. Anything that could reveal whether an account exists
 * (for example "user already exists") becomes the neutral `unknown`; the raw message is never shown.
 */
export function mapAuthError(error: ServiceError | null | undefined): AuthErrorCode {
  if (!error) return 'unknown';
  if (error.code && BY_CODE[error.code]) return BY_CODE[error.code];
  if (error.status === 429) return 'rate_limited';
  if (error.name === 'AuthRetryableFetchError' || error.status === 0) return 'network';
  return 'unknown';
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;
export const PASSWORD_LIMITS = { min: 8, max: 72 } as const;

export const isValidEmail = (email: string): boolean => email.length <= MAX_EMAIL_LENGTH && EMAIL.test(email);

export const isValidPassword = (password: string): boolean =>
  password.length >= PASSWORD_LIMITS.min && password.length <= PASSWORD_LIMITS.max;
