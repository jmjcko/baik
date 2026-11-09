'use client';

import React, { useEffect, useState } from 'react';
import { translations, Locale, type Translations } from '@/lib/i18n/translations';
import { useRiderProfile } from '@/lib/hooks/useRiderProfile';
import { useSetupMark } from '@/lib/hooks/useSetupMark';
import { useConsentSync } from '@/lib/consent/useConsentSync';
import { AppHeader } from '@/components/app/AppHeader';
import { Sidebar } from '@/components/navigation/Sidebar';
import type { Theme } from '@/components/navigation/appMode';
import type { AppMode } from '@/components/navigation/appMode';
import { ModeView } from '@/components/app/ModeView';
import { useJourney } from '@/lib/hooks/useJourney';
import { LOCALE_KEY, THEME_KEY, useStoredPreference } from '@/lib/hooks/useStoredPreference';
import { AuthRedirectNotice } from '@/components/auth/AuthRedirectNotice';
import { MergeDialog } from '@/components/auth/MergeDialog';
import { BikeDialog } from '@/components/garage/BikeDialog';
import { BikeEditDialog } from '@/components/garage/BikeEditDialog';
import { useBikeEdit } from '@/lib/hooks/useBikeEdit';
import { riderName } from '@/components/riders/riderName';
import { SyncNotice } from '@/components/auth/SyncNotice';
import { BookSyncNotice } from '@/components/service/BookSyncNotice';
import { useBookSync } from '@/lib/hooks/useBookSync';
import { useGearPurchaseSync } from '@/lib/hooks/useGearPurchases';
import { useStravaReturn } from '@/lib/strava/useStravaReturn';

const LOCALES: readonly Locale[] = ['en', 'cs'];
const THEMES: readonly Theme[] = ['light', 'dark'];

/** Keeps the document's data-theme and lang attributes in sync with the selected theme and language (once the stored choice is known, so a saved dark theme is not overwritten by the default). */
function useDocumentPreferences(theme: Theme, locale: Locale, ready: boolean): void {
  useEffect(() => {
    if (!ready) return;
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('lang', locale);
  }, [theme, locale, ready]);
}

/** The language and the theme of the rider, kept in this browser and written to the document. */
function useAppPreferences() {
  const [locale, setLocale, localeReady] = useStoredPreference<Locale>(LOCALE_KEY, LOCALES, 'en');
  const [theme, setTheme, themeReady] = useStoredPreference<Theme>(THEME_KEY, THEMES, 'light');
  useDocumentPreferences(theme, locale, localeReady && themeReady);
  return { locale, setLocale, theme, setTheme };
}

/** Whether the navigation drawer and the dialog of the bikes are open. */
function useOverlayState() {
  const [navOpen, setNavOpen] = useState(false);
  const [bikesOpen, setBikesOpen] = useState(false);
  return { navOpen, setNavOpen, bikesOpen, setBikesOpen };
}

/** The notices and the dialog that can appear over any page: the sign in result, the merge question and the sync error. */
function Overlays({ t, profile, bikesOpen, onCloseBikes, edit, onEditSetup }: { t: Translations; profile: ReturnType<typeof useRiderProfile>; bikesOpen: boolean; onCloseBikes: () => void; edit: ReturnType<typeof useBikeEdit>; onEditSetup: () => void }) {
  const bookSync = useBookSync();
  useGearPurchaseSync();
  const riders = profile.riders();
  const active = profile.garage()?.bikes.find((bike) => bike.isActive);
  return (
    <>
      {edit.open && active && <BikeEditDialog t={t} bike={active} care={profile.values.care} onRename={profile.renameBike} onDiscipline={profile.setters.setDiscipline} onCare={profile.setters.setCare} onEditSetup={() => { edit.close(); onEditSetup(); }} onSaved={edit.onSaved} onClose={edit.close} />}
      {bikesOpen && <BikeDialog t={t} garage={profile.garage()} onSwitch={profile.switchBike} onAdd={profile.addBike} onAddRider={riders ? profile.addRider : undefined} onClose={onCloseBikes} riders={riders?.riders.map((rider) => ({ id: rider.id, label: riderName(t, rider.name) }))} activeRiderId={riders?.activeRiderId} />}
      <AuthRedirectNotice t={t} />
      <MergeDialog t={t} prompt={profile.mergePrompt} onResolve={profile.resolveMerge} />
      <SyncNotice t={t} sync={profile.sync} />
      <BookSyncNotice t={t} sync={bookSync} />
    </>
  );
}

export default function Home() {
  const { locale, setLocale, theme, setTheme } = useAppPreferences();
  const [mode, setMode] = useState<AppMode>('entry');
  const t = translations[locale];
  const profile = useRiderProfile();
  const journey = useJourney(mode, setMode, useSetupMark(profile));
  useStravaReturn(() => journey.selectMode('care'));
  useConsentSync();
  const { navOpen, setNavOpen, bikesOpen, setBikesOpen } = useOverlayState();
  const garage = profile.garage();
  const edit = useBikeEdit(garage, profile.switchBike, journey.selectMode);
  return (
    <div className="h-screen overflow-hidden print:block print:h-auto print:overflow-visible bg-[var(--bg-canvas)] text-[var(--text-primary)] flex font-sans transition-colors duration-200">
      <Sidebar
        t={t} currentMode={mode} onSelectMode={journey.selectMode} locale={locale} theme={theme} onSetLocale={setLocale} onSetTheme={setTheme}
        journey={journey} garage={garage} onSwitchBike={(bikeId) => { setNavOpen(false); edit.openBike(bikeId); }} riders={profile.riders()} open={navOpen} onClose={() => setNavOpen(false)}
        onAddBike={() => { setNavOpen(false); setBikesOpen(true); }}
      />
      <div className="flex-1 min-w-0 flex flex-col print:block">
        <AppHeader t={t} mode={mode} garage={garage} onSwitchBike={profile.switchBike} sync={profile.sync} onOpenNav={() => setNavOpen(true)} navOpen={navOpen} />
        <main className="flex-1 min-w-0 overflow-y-auto print:overflow-visible">
          <div className={`mx-auto w-full p-4 md:p-8 print:p-0 ${mode === 'studio' ? 'max-w-[1800px]' : 'max-w-7xl'}`}>
            <ModeView t={t} locale={locale} mode={mode} setMode={journey.selectMode} profile={profile} journey={journey} onOpenBikes={() => setBikesOpen(true)} onEditBike={() => edit.edit()} bookTick={edit.saved} garageRequested={edit.garageRequested} onGarageShown={edit.onGarageShown} settings={{ theme, onSetLocale: setLocale, onSetTheme: setTheme }} />
          </div>
        </main>
      </div>
      <Overlays t={t} profile={profile} bikesOpen={bikesOpen} onCloseBikes={() => setBikesOpen(false)} edit={edit} onEditSetup={() => journey.openFromProfile('bike')} />
    </div>
  );
}
