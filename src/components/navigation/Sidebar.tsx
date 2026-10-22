'use client';

import React from 'react';
import { Locale, Translations } from '@/lib/i18n/translations';
import { BaikLogo } from '@/components/branding/BaikLogo';
import type { AppMode } from './ModeRouter';
import type { Journey } from '@/lib/hooks/useJourney';
import { JourneyStepper } from './JourneyStepper';
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
}

const SidebarBrand: React.FC<{ tagline: string; onHome: () => void }> = ({ tagline, onHome }) => (
  <button
    onClick={onHome}
    className="w-full text-center group focus:outline-none flex flex-col items-center gap-3 pt-1 pb-2"
    aria-label="bAIk - Universal AI Cycling Intelligence Hub"
  >
    <div className="flex items-center justify-center w-full">
      <BaikLogo variant="master" size={120} className="transform group-hover:scale-105 transition-transform duration-300" />
      <span className="sr-only">bAIk</span>
    </div>
    <p className="text-xs text-slate-300 font-medium leading-relaxed tracking-wide text-center px-1">{tagline}</p>
  </button>
);

const ActiveModule: React.FC<{ label: string; status: string; highlighted: boolean; onClick: () => void }> = ({
  label,
  status,
  highlighted,
  onClick,
}) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-3.5 py-2.5 rounded-xl font-medium text-xs flex items-center justify-between transition-all ${
      highlighted ? 'bg-blue-600 text-white shadow-sm' : 'bg-blue-600/90 text-white shadow-sm hover:bg-blue-600'
    }`}
  >
    <span className="font-semibold">{label}</span>
    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-100">{status}</span>
  </button>
);

const ComingSoonModule: React.FC<{ label: string; badge: string }> = ({ label, badge }) => (
  <div className="px-3.5 py-2.5 rounded-xl text-xs text-slate-400 border border-slate-800/80 bg-slate-900/40 flex items-center justify-between cursor-not-allowed">
    <span>{label}</span>
    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-full border border-amber-500/30 text-amber-400 bg-amber-950/20">
      {badge}
    </span>
  </div>
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

const ModuleList: React.FC<{ t: Translations; currentMode: AppMode; onHome: () => void }> = ({ t, currentMode, onHome }) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold px-1">
      {t.navigation.studio}
    </span>
    <ActiveModule
      label={t.navigation.baikfitEngine}
      status={t.dashboard.activeStatus}
      highlighted={currentMode !== 'entry' && currentMode !== 'profile'}
      onClick={onHome}
    />
    <ComingSoonModule label={t.navigation.baikcareStudio} badge={t.navigation.comingSoon} />
    <ComingSoonModule label={t.navigation.baikshopAdvisory} badge={t.navigation.comingSoon} />
  </div>
);

interface SidebarFooterProps extends Pick<SidebarProps, 't' | 'locale' | 'theme' | 'onSetLocale' | 'onSetTheme'> {
  profileActive: boolean;
  onOpenProfile: () => void;
}

/** Bottom of the sidebar: the system controls with the account block, and "My profile" under the sign in. */
const SidebarFooter: React.FC<SidebarFooterProps> = ({ t, locale, theme, onSetLocale, onSetTheme, profileActive, onOpenProfile }) => (
  <div className="flex flex-col gap-4">
    <SidebarControls t={t} locale={locale} theme={theme} onSetLocale={onSetLocale} onSetTheme={onSetTheme} />
    <ProfileLink t={t} active={profileActive} onOpen={onOpenProfile} />
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
}) => {
  const goHome = () => onSelectMode('entry');
  return (
    <aside className="print:hidden w-64 bg-[#1e1e2d] text-slate-100 flex flex-col justify-between gap-5 shrink-0 border-r border-slate-800 h-screen overflow-y-auto p-4 select-none transition-colors">
      <div className="flex flex-col gap-6">
        <SidebarBrand tagline={t.common.tagline} onHome={goHome} />
        <ModuleList t={t} currentMode={currentMode} onHome={goHome} />
        <JourneyStepper t={t} journey={journey} />
        {currentMode !== 'entry' && !journey?.active && (
          <BackToHub label={t.dashboard.backToHub} modeLabel={currentMode} onClick={goHome} />
        )}
      </div>
      <SidebarFooter {...{ t, locale, theme, onSetLocale, onSetTheme }} profileActive={currentMode === 'profile'} onOpenProfile={() => onSelectMode('profile')} />
    </aside>
  );
};
