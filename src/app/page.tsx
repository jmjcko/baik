'use client';

import React, { useEffect, useState } from 'react';
import { translations, Locale } from '@/lib/i18n/translations';
import { useRiderProfile } from '@/lib/hooks/useRiderProfile';
import { Sidebar } from '@/components/navigation/Sidebar';
import type { Theme } from '@/components/navigation/SidebarControls';
import type { AppMode } from '@/components/navigation/ModeRouter';
import { ModeView } from '@/components/app/ModeView';
import { useJourney } from '@/lib/hooks/useJourney';

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
  const journey = useJourney(mode, setMode);
  useDocumentTheme(theme);

  return (
    <div className="h-screen overflow-hidden bg-[var(--bg-canvas)] text-[var(--text-primary)] flex font-sans transition-colors duration-200">
      <Sidebar
        t={t}
        currentMode={mode}
        onSelectMode={journey.selectMode}
        locale={locale}
        theme={theme}
        onSetLocale={setLocale}
        onSetTheme={setTheme}
        journey={journey}
        inseamMm={profile.values.inseamMm}
        discipline={t.studio.disciplines[profile.values.discipline]}
      />
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className={`mx-auto w-full p-4 md:p-8 ${mode === 'studio' ? 'max-w-[1800px]' : 'max-w-7xl'}`}>
          <ModeView t={t} locale={locale} mode={mode} setMode={journey.selectMode} profile={profile} journey={journey} />
        </div>
      </main>
    </div>
  );
}
