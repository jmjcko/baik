import { describe, it, expect } from 'vitest';
import { isValidEmail, isValidPassword, mapAuthError } from '../errors';

describe('mapAuthError', () => {
  it.each([
    [{ code: 'invalid_credentials', status: 400 }, 'invalid_credentials'],
    [{ code: 'email_not_confirmed' }, 'email_not_confirmed'],
    [{ code: 'weak_password' }, 'weak_password'],
    [{ code: 'over_email_send_rate_limit' }, 'rate_limited'],
    [{ code: 'over_request_rate_limit' }, 'rate_limited'],
    [{ status: 429 }, 'rate_limited'],
    [{ name: 'AuthRetryableFetchError', status: 0 }, 'network'],
    [{ status: 0 }, 'network'],
  ])('should map %j to %s', (error, expected) => {
    expect(mapAuthError(error)).toBe(expected);
  });

  it('should not reveal that an account exists or pass on unknown messages', () => {
    expect(mapAuthError({ code: 'user_already_exists', status: 422 })).toBe('unknown');
    expect(mapAuthError({ code: 'something_new' })).toBe('unknown');
    expect(mapAuthError(null)).toBe('unknown');
    expect(mapAuthError(undefined)).toBe('unknown');
  });
});

describe('input checks', () => {
  it.each(['rider@example.com', 'a.b+c@sub.example.cz'])('should accept the email %s', (email) => expect(isValidEmail(email)).toBe(true));

  it.each(['', 'rider', 'rider@', '@example.com', 'a b@example.com', `${'a'.repeat(250)}@example.com`])('should refuse the email %j', (email) =>
    expect(isValidEmail(email)).toBe(false)
  );

  it('should accept passwords of 8 to 72 characters only', () => {
    expect(isValidPassword('1234567')).toBe(false);
    expect(isValidPassword('12345678')).toBe(true);
    expect(isValidPassword('x'.repeat(72))).toBe(true);
    expect(isValidPassword('x'.repeat(73))).toBe(false);
  });
});
