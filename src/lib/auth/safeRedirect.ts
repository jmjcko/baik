const decode = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return '\u0000';
  }
};

/** A path of this app: one leading slash, no backslash and no control character (also not after decoding). */
const isLocalPath = (value: string): boolean => value.startsWith('/') && !value.startsWith('//') && !value.includes('\\') && !/[\u0000-\u001f\u007f]/.test(value);

/**
 * The path to continue to after signing in. Only a path inside this app is allowed (starts with one slash, no
 * protocol, host, backslash or control character), so the callback cannot be used as an open redirect.
 */
export function safeNextPath(next: string | null | undefined, fallback = '/'): string {
  if (!next || next.length > 200) return fallback;
  if (!isLocalPath(next) || !isLocalPath(decode(next))) return fallback;
  try {
    const url = new URL(next, 'http://localhost');
    return url.origin === 'http://localhost' ? `${url.pathname}${url.search}` : fallback;
  } catch {
    return fallback;
  }
}
