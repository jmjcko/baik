import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** Every source file of the app (not the tests). */
function sources(dir = 'src'): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === '__tests__' ? [] : sources(path);
    return /\.(ts|tsx|css)$/.test(name) ? [path] : [];
  });
}

describe('rules of the Aurora design system (Epic 27)', () => {
  const files = sources();

  it('should have no glass effect anywhere: no backdrop blur and no translucent surface class', () => {
    const offenders = files.filter((file) => /backdrop-blur|backdrop-filter/.test(readFileSync(file, 'utf8')));
    expect(offenders).toEqual([]);
  });

  it('should dim the page behind a dialog with the scrim token, not with a hard-coded color', () => {
    for (const file of ['src/components/auth/AuthDialog.tsx', 'src/components/auth/MergeDialog.tsx', 'src/components/baikfit/MeasurementGuideModal.tsx', 'src/components/report/EducationalModal.tsx']) {
      const text = readFileSync(file, 'utf8');
      expect(text).toContain('bg-scrim');
      expect(text).not.toMatch(/bg-(black|slate-900)\/\d+/);
    }
    expect(readFileSync('src/app/globals.css', 'utf8')).toContain('--surface-scrim');
  });

  it('should keep the Aurora surfaces in the tokens: the base, the dark section and an opaque white card', () => {
    const css = readFileSync('src/app/globals.css', 'utf8');
    expect(css).toMatch(/--bg-canvas:\s*#f8fafc/i);
    expect(css).toMatch(/--surface-section:\s*#0f172a/i);
    expect(css).toMatch(/--surface-card:\s*#ffffff/i);
    expect(css).toMatch(/--border-subtle:\s*#e2e8f0/i);
    expect(css).toContain('[data-theme="dark"]');
  });

  it('should use no emoji in the source (text arrows and check marks are not emoji), and take every icon from lucide-react', () => {
    const emoji = files.filter((file) => /\p{Extended_Pictographic}/u.test(readFileSync(file, 'utf8').replace(/[←-⇿✓✔▾▴]/g, '')));
    expect(emoji).toEqual([]);
    const iconImports = files.flatMap((file) => [...readFileSync(file, 'utf8').matchAll(/from '(react-icons[^']*|@heroicons[^']*|@mui\/icons[^']*)'/g)].map(() => file));
    expect(iconImports).toEqual([]);
  });

  it('should state the rule in AGENTS.md: no emoji, icons only for functional UI', () => {
    const agents = readFileSync('AGENTS.md', 'utf8');
    expect(agents).toContain('Icons are allowed only for functional UI elements');
    expect(agents).toContain('lucide-react');
    expect(agents).not.toContain('NO decorative icon boxes');
    expect(agents).not.toMatch(/there is NO top navbar in any view/);
  });
});
