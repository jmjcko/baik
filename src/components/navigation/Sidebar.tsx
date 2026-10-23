'use client';

import React from 'react';
import { Bike, LayoutDashboard, Plus, ShoppingCart, Wrench } from 'lucide-react';
import { Locale, Translations } from '@/lib/i18n/translations';
import { cx } from '@/lib/classNames';
import { bikeTitle } from '@/components/profile/GarageSection';
import type { BikeProfile } from '@/lib/passport/types';
import { BaikLogo } from '@/components/branding/BaikLogo';
import type { AppMode } from './appMode';
import type { Journey } from '@/lib/hooks/useJourney';
import { JourneyStepper } from './JourneyStepper';
import { NavItem } from './NavItem';
import { AdminLink } from './AdminLink';
import { CapabilitiesLink } from './CapabilitiesLink';
import { ProfileLink } from './ProfileLink';
import { SidebarControls, type Theme } from './SidebarControls';

interface SidebarProps {
  t: Translations;
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  locale: Locale;
  theme: Theme;
  onSetLocale: (locale: Locale) => void;
  onSetTheme: (theme: Theme) => void;
  /** Fit journey state; the stepper is shown only while the rider is inside the journey. */
  journey?: Journey;
  /** The bikes of the garage for "My bikes"; none while the measurements cannot be stored. */
  garage?: SidebarGarage | null;
  onSwitchBike?: (bikeId: string) => void;
  /** The way to add a bike (a signed in rider opens the garage of the profile). */
  onAddBike?: () => void;
}

const SidebarBrand: React.FC<{ title: string; tagline: string; onHome: () => void }> = ({ title, tagline, onHome }) => (
  <button
    onClick={onHome}
    className="w-full text-center group focus:outline-none flex flex-col items-center gap-3 pt-1 pb-2"
    aria-label={`${title} - ${tagline}`}
  >
    <div className="flex items-center justify-center w-full">
      <BaikLogo variant="master" size={120} className="transform group-hover:scale-105 transition-transform duration-300" />
      <span className="sr-only">bAIk</span>
    </div>
    <p className="text-lg font-extrabold tracking-tight text-slate-50">{title}</p>
    <p className="text-xs text-slate-300 font-medium leading-relaxed tracking-wide text-center px-1">{tagline}</p>
  </button>
);

const BackToHub: React.FC<{ label: string; modeLabel: string; onClick: () => void }> = ({ label, modeLabel, onClick }) => (
  <div className="pt-2 border-t border-slate-800">
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2 rounded-lg text-xs font-mono text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center justify-between"
    >
      <span>← {label}</span>
      <span className="text-[10px] text-slate-500 uppercase">{modeLabel}</span>
    </button>
  </div>
);

const SECTION_LABEL = 'text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold px-1';

/** The modules: the dashboard, the bAIkfit engine (the setup guide) and the two modules that do not exist yet. */
const MainNav: React.FC<{ t: Translations; currentMode: AppMode; onSelectMode: (mode: AppMode) => void }> = ({ t, currentMode, onSelectMode }) => {
  const inJourney = currentMode === 'wizard' || currentMode === 'report' || currentMode === 'studio' || currentMode === 'prepurchasing';
  return (
    <nav aria-label={t.shell.sidebar.mainLabel} className="flex flex-col gap-1.5">
      <span className={SECTION_LABEL}>{t.navigation.studio}</span>
      <NavItem icon={LayoutDashboard} label={t.shell.sidebar.dashboard} active={currentMode === 'entry'} onClick={() => onSelectMode('entry')} />
      <NavItem icon={Bike} label={t.navigation.baikfitEngine} active={inJourney} onClick={() => onSelectMode('wizard')} />
      <NavItem icon={Wrench} label={t.navigation.baikcareStudio} badge={t.navigation.comingSoon} />
      <NavItem icon={ShoppingCart} label={t.navigation.baikshopAdvisory} badge={t.navigation.comingSoon} />
    </nav>
  );
};

export interface SidebarGarage {
  bikes: BikeProfile[];
  activeBikeId: string;
}

interface MyBikesProps {
  t: Translations;
  garage: SidebarGarage | null;
  onSwitchBike: (bikeId: string) => void;
  /** The way to add a bike: the garage of the profile page, for a signed in rider only. */
  onAddBike?: () => void;
}

/** "My bikes": the bikes of the garage, the active one marked; choosing another makes it the active bike. */
const MyBikes: React.FC<MyBikesProps> = ({ t, garage, onSwitchBike, onAddBike }) => (
  <section aria-label={t.shell.sidebar.myBikes} className="flex flex-col gap-1.5" data-testid="sidebar-garage">
    <span className={SECTION_LABEL}>{t.shell.sidebar.myBikes}</span>
    {(garage?.bikes ?? []).map((bike) => (
      <button
        key={bike.id}
        type="button"
        onClick={() => onSwitchBike(bike.id)}
        aria-current={bike.isActive ? 'true' : undefined}
        className={cx('w-full text-left px-3.5 py-2 rounded-xl text-xs flex items-center justify-between gap-2 transition-colors', bike.isActive ? 'bg-slate-800 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800')}
      >
        <span className="flex items-center gap-2.5 min-w-0"><Bike aria-hidden="true" className="w-4 h-4 shrink-0" /><span className="truncate">{bikeTitle(t.profile.garage, bike)}</span></span>
        {bike.isActive && <span className="text-[9px] font-mono uppercase text-emerald-300">{t.shell.sidebar.activeBike}</span>}
      </button>
    ))}
    {!garage?.bikes.length && <span className="px-3.5 text-xs text-slate-500">{t.shell.sidebar.noBikes}</span>}
    {onAddBike && <NavItem icon={Plus} label={t.shell.sidebar.addBike} onClick={onAddBike} />}
  </section>
);

interface SidebarFooterProps extends Pick<SidebarProps, 't' | 'locale' | 'theme' | 'onSetLocale' | 'onSetTheme'> {
  profileActive: boolean;
  onOpenProfile: () => void;
  adminActive: boolean;
  onOpenAdmin: () => void;
  capabilitiesActive: boolean;
  onOpenCapabilities: () => void;
}

/** Bottom of the sidebar: the system controls with the account block, and "My profile" under the sign in. */
const SidebarFooter: React.FC<SidebarFooterProps> = ({ t, locale, theme, onSetLocale, onSetTheme, profileActive, onOpenProfile, adminActive, onOpenAdmin, capabilitiesActive, onOpenCapabilities }) => (
  <div className="flex flex-col gap-4">
    <SidebarControls t={t} locale={locale} theme={theme} onSetLocale={onSetLocale} onSetTheme={onSetTheme} />
    <CapabilitiesLink t={t} active={capabilitiesActive} onOpen={onOpenCapabilities} />
    <ProfileLink t={t} active={profileActive} onOpen={onOpenProfile} />
    <AdminLink t={t} active={adminActive} onOpen={onOpenAdmin} />
  </div>
);

export const Sidebar: React.FC<SidebarProps> = ({
  t,
  currentMode,
  onSelectMode,
  locale,
  theme,
  onSetLocale,
  onSetTheme,
  journey,
  garage = null,
  onSwitchBike,
  onAddBike,
}) => {
  const goHome = () => onSelectMode('entry');
  return (
    <aside className="print:hidden w-64 bg-[#1e1e2d] text-slate-100 flex flex-col justify-between gap-5 shrink-0 border-r border-slate-800 h-screen overflow-y-auto p-4 select-none transition-colors">
      <div className="flex flex-col gap-6">
        <SidebarBrand title={t.common.appTitle} tagline={t.common.tagline} onHome={goHome} />
        <MainNav t={t} currentMode={currentMode} onSelectMode={onSelectMode} />
        <JourneyStepper t={t} journey={journey} />
        {onSwitchBike && <MyBikes t={t} garage={garage} onSwitchBike={onSwitchBike} onAddBike={onAddBike} />}
        {currentMode !== 'entry' && !journey?.active && (
          <BackToHub label={t.dashboard.backToHub} modeLabel={currentMode} onClick={goHome} />
        )}
      </div>
      <SidebarFooter {...{ t, locale, theme, onSetLocale, onSetTheme }} profileActive={currentMode === 'profile'} onOpenProfile={() => onSelectMode('profile')} adminActive={currentMode === 'admin'} onOpenAdmin={() => onSelectMode('admin')} capabilitiesActive={currentMode === 'capabilities'} onOpenCapabilities={() => onSelectMode('capabilities')} />
    </aside>
  );
};
