import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { VersionLine } from '../VersionLine';

describe.each(['en', 'cs'] as Locale[])('the version line (%s)', (locale) => {
  const t = translations[locale];

  it('should say which version runs, in the language of the app, with the commit and the day', () => {
    render(<VersionLine t={t} info={{ version: '0.48.3', commit: '223eab0', built: '2026-11-09' }} />);
    expect(screen.getByTestId('app-version')).toHaveTextContent(`${t.navigation.versionLabel} v0.48.3 · 223eab0 · 2026-11-09`);
  });

  it('should show dev when the build has no version, and no emoji', () => {
    render(<VersionLine t={t} />);
    expect(screen.getByTestId('app-version')).toHaveTextContent(`${t.navigation.versionLabel} dev`);
    expect(document.body.textContent).not.toMatch(/\p{Extended_Pictographic}/u);
  });
});
