import { describe, it, expect } from 'vitest';
import { isValidExternalUrl } from '../urlGuard';

describe('isValidExternalUrl (SSRF guard)', () => {
  it('accepts public http and https URLs', () => {
    expect(isValidExternalUrl('https://www.canyon.com/en-cz/road-bikes/')).toBe(true);
    expect(isValidExternalUrl('http://example.org/bike')).toBe(true);
  });

  it('rejects non-http protocols and embedded credentials', () => {
    for (const u of ['file:///etc/passwd', 'ftp://example.com', 'javascript:alert(1)', 'https://user:pw@example.com']) {
      expect(isValidExternalUrl(u)).toBe(false);
    }
  });

  it('rejects the full private 172.16.0.0/12 range, not just 172.16.x', () => {
    expect(isValidExternalUrl('http://172.16.0.1/')).toBe(false);
    expect(isValidExternalUrl('http://172.20.5.5/')).toBe(false);
    expect(isValidExternalUrl('http://172.31.255.254/')).toBe(false);
    expect(isValidExternalUrl('http://172.32.0.1/')).toBe(true);
  });

  it('rejects loopback, link-local, CGNAT and metadata hosts', () => {
    for (const u of [
      'http://127.0.0.2/',
      'http://0.0.0.0/',
      'http://169.254.169.254/latest/meta-data/',
      'http://100.64.0.1/',
      'http://metadata.google.internal/computeMetadata/v1/',
      'http://printer.local/',
      'http://localhost./',
    ]) {
      expect(isValidExternalUrl(u)).toBe(false);
    }
  });

  it('rejects IPv6 loopback, unique-local, link-local and mapped addresses', () => {
    for (const u of ['http://[::1]/', 'http://[fd00::1]/', 'http://[fe80::1]/', 'http://[::ffff:127.0.0.1]/']) {
      expect(isValidExternalUrl(u)).toBe(false);
    }
  });

  it('rejects numeric IPv4 spellings that normalize to private addresses', () => {
    expect(isValidExternalUrl('http://2130706433/')).toBe(false); // 127.0.0.1
    expect(isValidExternalUrl('http://0x7f.0.0.1/')).toBe(false);
  });
});
