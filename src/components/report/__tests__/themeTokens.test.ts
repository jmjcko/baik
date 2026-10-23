import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

const ROOTS = ['src/components/report', 'src/components/studio', 'src/components/primitives', 'src/components/profile', 'src/components/dashboard', 'src/components/capabilities', 'src/components/admin', 'src/components/illustrations'];

/** The pages that were moved onto the Aurora tokens in Epic 27 (phase 2) must not fall back to fixed light colors either. */
const PAGE_ROOTS = ['src/components/wizard', 'src/components/bikes', 'src/components/prepurchasing'];
const FIXED_LIGHT = [/(?<![\w:-])bg-white\b(?!\/)/, /(?<![\w:-])bg-slate-(?:50|100|200)\b/, /(?<![\w:-])border-slate-(?:100|200|300)\b/, /(?<![\w:-])text-slate-(?:600|700|800|900)\b/];

/** Hard-coded dark or light surface and text classes that bypass the M3 theme tokens (AGENTS.md section 5). */
const FORBIDDEN = [
  /(?<![\w:-])bg-slate-(?:800|900|950)\b/,
  /(?<![\w:-])text-white\b/,
  /(?<![\w:-])text-slate-(?:100|200|300|400|500)\b/,
  /(?<![\w:-])border-slate-(?:700|800)\b/,
  /(?<![\w:-])bg-(?:rose|amber|cyan|teal|emerald|red)-950\b/,
];

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === '__tests__' ? [] : sources(path);
    return /\.tsx?$/.test(name) ? [path] : [];
  });
}

describe('theme tokens (report, studio, primitives and profile)', () => {
  it.each(ROOTS.flatMap(sources))('should not hard-code card or text colors in %s', (file) => {
    const text = readFileSync(file, 'utf8');
    for (const pattern of FORBIDDEN) expect(text, `${file} matches ${pattern}`).not.toMatch(pattern);
  });

  it.each(PAGE_ROOTS.flatMap(sources))('should use tokens, not fixed light colors, in the page file %s', (file) => {
    const text = readFileSync(file, 'utf8');
    for (const pattern of [...FORBIDDEN, ...FIXED_LIGHT]) expect(text, `${file} matches ${pattern}`).not.toMatch(pattern);
  });

  it('should keep the CAD drawing colors in theme variables', () => {
    for (const file of sources('src/components/studio/wireframe')) {
      const text = readFileSync(file, 'utf8');
      expect(text, file).not.toMatch(/["']#(?:090d16|f8fafc|cbd5e1)["']/);
    }
  });
});
