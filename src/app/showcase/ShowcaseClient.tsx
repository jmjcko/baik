'use client';

import React, { useEffect, useState } from 'react';
import { translations, type Locale, type Translations } from '@/lib/i18n/translations';
import { ShowcaseToolbar, type ThemeMode } from './ShowcaseToolbar';
import { DiagnosisSection } from './sections/DiagnosisSection';
import { GuidesSection } from './sections/GuidesSection';
import { SchematicsSection } from './sections/SchematicsSection';
import { StudioSection } from './sections/StudioSection';
import { TargetsSection } from './sections/TargetsSection';

const PAGE = 'bg-[var(--bg-canvas)] text-[var(--text-primary)]';

const ShowcaseBody: React.FC<{ t: Translations }> = ({ t }) => (
  <div className="space-y-16">
    <TargetsSection t={t} />
    <SchematicsSection t={t} />
    <GuidesSection t={t} />
    <DiagnosisSection t={t} />
    <StudioSection t={t} />
  </div>
);

const PANEL_WIDTH = 1100;

/**
 * Every section twice, each inside a container that scopes the theme tokens (light on the left, dark on the right).
 * Breakpoints follow the window, so each panel keeps the full width of a real page and the pair is scaled down to fit.
 */
const SideBySide: React.FC<{ t: Translations }> = ({ t }) => (
  <div className="overflow-x-auto">
    <div className="grid gap-6 w-max" style={{ gridTemplateColumns: `repeat(2, ${PANEL_WIDTH}px)`, zoom: 0.8 }}>
      {(['light', 'dark'] as const).map((theme) => (
        <div key={theme} data-theme={theme} data-testid={`themed-${theme}`} className={`${PAGE} rounded-2xl border border-line p-5 min-w-0`}>
          <ShowcaseBody t={t} />
        </div>
      ))}
    </div>
  </div>
);

/** Component gallery: all report and studio components in their states, with theme and language switches. */
export const ShowcaseClient: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [locale, setLocale] = useState<Locale>('en');
  const t = translations[locale];

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
    document.documentElement.lang = locale;
  }, [theme, locale]);

  return (
    <div className={`min-h-screen ${PAGE}`}>
      <ShowcaseToolbar theme={theme} onTheme={setTheme} locale={locale} onLocale={setLocale} />
      <main className={`${theme === 'both' ? '' : 'max-w-7xl mx-auto '}p-6`}>{theme === 'both' ? <SideBySide t={t} /> : <ShowcaseBody t={t} />}</main>
    </div>
  );
};
