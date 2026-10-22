import { describe, it, expect } from 'vitest';
import { safeNextPath } from '../safeRedirect';

describe('safeNextPath', () => {
  it.each([['/', '/'], ['/report', '/report'], ['/a/b?x=1', '/a/b?x=1'], ['/studio#top', '/studio']])('should keep the local path %s', (input, expected) => {
    expect(safeNextPath(input)).toBe(expected);
  });

  it.each([null, undefined, '', 'report', '//evil.example', 'https://evil.example', '/\\evil', '/a\\b', '/x\ny', `/${'a'.repeat(300)}`, 'javascript:alert(1)'])(
    'should fall back for %j',
    (input) => expect(safeNextPath(input)).toBe('/')
  );

  it('should use the given fallback', () => {
    expect(safeNextPath('//x', '/home')).toBe('/home');
  });
});
