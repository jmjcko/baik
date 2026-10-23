'use client';

import React, { useEffect, useState } from 'react';
import { translations, Locale, type Translations } from '@/lib/i18n/translations';
import { useRiderProfile } from '@/lib/hooks/useRiderProfile';
import { useAuth } from '@/lib/auth/AuthContext';
import { AppHeader } from '@/components/app/AppHeader';
import { Sidebar } from '@/components/navigation/Sidebar';
import type { Theme } from '@/components/navigation/SidebarControls';
import type { AppMode } from '@/components/navigation/appMode';
import { ModeView } from '@/components/app/ModeView';
import { useJourney } from '@/lib/hooks/useJourney';
import { AuthRedirectNotice } from '@/components/auth/AuthRedirectNotice';
import { MergeDialog } from '@/components/auth/MergeDialog';
import { SyncNotice } from '@/components/auth/SyncNotice';

/** Keeps the document's data-theme attribute in sync with the selected theme. */
function useDocumentTheme(theme: Theme): void {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
}

/** The notices and the dialog that can appear over any page: the sign in result, the merge question and the sync error. */
function Overlays({ t, profile }: { t: Translations; profile: ReturnType<typeof useRiderProfile> }) {
  return (
    <>
      <AuthRedirectNotice t={t} />
      <MergeDialog t={t} prompt={profile.mergePrompt} onResolve={profile.resolveMerge} />
      <SyncNotice t={t} sync={profile.sync} />
    </>
  );
}

export default function Home() {
  const [locale, setLocale] = useState<Locale>('en');
  const [theme, setTheme] = useState<Theme>('light');
  const [mode, setMode] = useState<AppMode>('entry');
  const t = translations[locale];
  const profile = useRiderProfile();
  const journey = useJourney(mode, setMode);
  const [navOpen, setNavOpen] = useState(false);
  const auth = useAuth();
  useDocumentTheme(theme);
  const garage = profile.garage();

  return (
    <div className="h-screen overflow-hidden print:block print:h-auto print:overflow-visible bg-[var(--bg-canvas)] text-[var(--text-primary)] flex font-sans transition-colors duration-200">
      <Sidebar
        t={t} currentMode={mode} onSelectMode={journey.selectMode} locale={locale} theme={theme} onSetLocale={setLocale} onSetTheme={setTheme}
        journey={journey} garage={garage} onSwitchBike={profile.switchBike} open={navOpen} onClose={() => setNavOpen(false)}
        onAddBike={auth.status === 'authenticated' ? () => journey.selectMode('profile') : undefined}
      />
      <div className="flex-1 min-w-0 flex flex-col print:block">
        <AppHeader t={t} mode={mode} garage={garage} onSwitchBike={profile.switchBike} sync={profile.sync} onOpenNav={() => setNavOpen(true)} navOpen={navOpen} />
        <main className="flex-1 min-w-0 overflow-y-auto print:overflow-visible">
          <div className={`mx-auto w-full p-4 md:p-8 print:p-0 ${mode === 'studio' ? 'max-w-[1800px]' : 'max-w-7xl'}`}>
            <ModeView t={t} locale={locale} mode={mode} setMode={journey.selectMode} profile={profile} journey={journey} />
          </div>
        </main>
      </div>
      <Overlays t={t} profile={profile} />
    </div>
  );
}
