/**
 * SSRF guard for user-supplied URLs (OWASP SSRF Prevention, ADR-004).
 * Accepts only public http(s) hosts. Note: `new URL()` already normalizes
 * decimal / hex / octal IPv4 spellings (e.g. http://2130706433) to dotted form.
 */

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'metadata.google.internal',
  'metadata',
  'instance-data',
]);

const BLOCKED_SUFFIXES = ['.localhost', '.local', '.internal', '.lan', '.home.arpa'];

function isPrivateIPv4(host: string): boolean {
  const m = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return false;
  const [a, b] = [Number(m[1]), Number(m[2])];
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) || // carrier-grade NAT
    (a === 169 && b === 254) || // link-local + cloud metadata
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a >= 224 // multicast / reserved
  );
}

function isPrivateIPv6(host: string): boolean {
  const h = host.replace(/^\[|\]$/g, '').toLowerCase();
  if (!h.includes(':')) return false;
  if (h === '::' || h === '::1') return true;
  if (h.startsWith('fc') || h.startsWith('fd')) return true; // unique local fc00::/7
  if (/^fe[89ab]/.test(h)) return true; // link-local fe80::/10
  const mapped = h.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/); // IPv4-mapped
  if (mapped) return isPrivateIPv4(mapped[1]);
  if (h.startsWith('::ffff:')) return true; // hex-form mapped address: be conservative
  return false;
}

export function isValidExternalUrl(urlStr: string): boolean {
  try {
    const url = new URL(urlStr);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    if (url.username || url.password) return false;

    const hostname = url.hostname.toLowerCase().replace(/\.$/, '');
    if (!hostname) return false;
    if (BLOCKED_HOSTNAMES.has(hostname)) return false;
    if (BLOCKED_SUFFIXES.some((suffix) => hostname.endsWith(suffix))) return false;
    if (isPrivateIPv4(hostname) || isPrivateIPv6(hostname)) return false;
    return true;
  } catch {
    return false;
  }
}
