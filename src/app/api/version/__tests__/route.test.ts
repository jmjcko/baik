import { describe, it, expect } from 'vitest';
import { GET } from '../route';

describe('/api/version', () => {
  it('should answer with the version, the commit and the day of the build, and nothing else, without caching', async () => {
    const response = GET();
    expect(response.headers.get('cache-control')).toBe('no-store');
    const body = await response.json();
    expect(Object.keys(body).sort()).toEqual(['built', 'commit', 'version']);
    expect(typeof body.version).toBe('string');
  });
});
