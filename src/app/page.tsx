'use client';

import React, { useEffect, useState } from 'react';
import { translations, Locale } from '@/lib/i18n/translations';
import { useRiderProfile } from '@/lib/hooks/useRiderProfile';
import { Sidebar } from '@/components/navigation/Sidebar';
import { TopNavbar } from '@/components/navigation/TopNavbar';
import type { AppMode } from '@/components/navigation/ModeRouter';
import { ModeView } from '@/components/app/ModeView';

type Theme = 'dark' | 'light';

/** Keeps the document's data-theme attribute in sync with the selected theme. */
function useDocumentTheme(theme: Theme): void {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
}

export default function Home() {
  const [locale, setLocale] = useState<Locale>('en');
  const [theme, setTheme] = useState<Theme>('light');
  const [mode, setMode] = useState<AppMode>('entry');
  const t = translations[locale];
  const profile = useRiderProfile(t);
  useDocumentTheme(theme);

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex font-sans transition-colors duration-200">
      <Sidebar t={t} currentMode={mode} onSelectMode={setMode} inseamMm={profile.values.inseamMm} discipline={profile.values.discipline} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar
          locale={locale}
          theme={theme}
          t={t}
          onToggleLocale={() => setLocale((prev) => (prev === 'en' ? 'cs' : 'en'))}
          onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
          onSelectBaikfit={() => setMode('entry')}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl w-full mx-auto">
          <ModeView t={t} locale={locale} mode={mode} setMode={setMode} profile={profile} />
        </main>
      </div>
    </div>
  );
}
