'use client';

import React from 'react';
import { Bike, BookOpen, ShoppingCart, Wrench } from 'lucide-react';
import { Locale, Translations } from '@/lib/i18n/translations';
import { cx } from '@/lib/classNames';
import { BaikLogo } from '@/components/branding/BaikLogo';
import type { AppMode, Theme } from './appMode';
import type { Journey } from '@/lib/hooks/useJourney';
import { AccountMenu } from './AccountMenu';
import { VersionLine } from './VersionLine';
import { RidingNow, type SidebarGarage, type SidebarRiders } from './RidingNow';
import { JourneyStepper } from './JourneyStepper';
import { NavItem } from './NavItem';
import { AdminLink } from './AdminLink';

export type { SidebarGarage, SidebarRiders };

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
  /** The bikes of the garage for "Riding now"; none while the measurements cannot be stored. */
  garage?: SidebarGarage | null;
  onSwitchBike?: (bikeId: string) => void;
  /** The way to add a bike or a rider (a signed in rider opens the bike dialog). */
  onAddBike?: () => void;
  /** The people of the account (the bikes are grouped by rider when there are two or more). */
  riders?: SidebarRiders | null;
  /** On a narrow screen the sidebar is a drawer: open or closed, and the way to close it. */
  open?: boolean;
  onClose?: () => void;
}

/** The logo and the name of the app on one row: pressing it leads to the dashboard (there is no separate dashboard link). */
const SidebarBrand: React.FC<{ title: string; tagline: string; homeLabel: string; active: boolean; onHome: () => void }> = ({ title, tagline, homeLabel, active, onHome }) => (
  <button
    type="button"
    onClick={onHome}
    title={homeLabel}
    aria-current={active ? 'page' : undefined}
    className="w-full group focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl flex items-center gap-3 px-1 py-1 cursor-pointer text-left"
    aria-label={`${title} - ${tagline}`}
  >
    <BaikLogo variant="master" size={44} className="shrink-0 transition-transform duration-300 group-hover:scale-105" />
    <span className="sr-only">bAIk</span>
    <span className="min-w-0">
      <span className="block text-lg font-extrabold tracking-tight text-slate-50 leading-tight">{title}</span>
      <span className="sr-only">{tagline}</span>
    </span>
  </button>
);

const SECTION_LABEL = 'text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold px-1';

/** The modules: the bAIkfit engine (the setup guide), the bAIkcare workshop, the bAIkgear advisor (the module is called bAIkshop inside) and the bAIkedu academy. */
const MainNav: React.FC<{ t: Translations; currentMode: AppMode; onSelectMode: (mode: AppMode) => void }> = ({ t, currentMode, onSelectMode }) => {
  const inJourney = currentMode === 'fit' || currentMode === 'wizard' || currentMode === 'report' || currentMode === 'studio' || currentMode === 'prepurchasing';
  return (
    <nav aria-label={t.shell.sidebar.mainLabel} className="flex flex-col gap-1.5">
      <span className={SECTION_LABEL}>{t.shell.sidebar.modules}</span>
      <NavItem prominent accentAfter="bAIk" icon={Bike} label={t.navigation.baikfitEngine} active={inJourney} onClick={() => onSelectMode('fit')} />
      <NavItem prominent accentAfter="bAIk" icon={Wrench} label={t.navigation.baikcareStudio} active={currentMode === 'care'} onClick={() => onSelectMode('care')} />
      <NavItem prominent accentAfter="bAIk" icon={ShoppingCart} label={t.navigation.baikshopAdvisory} active={currentMode === 'gear'} onClick={() => onSelectMode('gear')} />
      <NavItem prominent accentAfter="bAIk" icon={BookOpen} label={t.navigation.baikeduAcademy} active={currentMode === 'edu'} onClick={() => onSelectMode('edu')} />
    </nav>
  );
};

/** On a narrow screen the sidebar is a drawer over the page; from the medium width on it is part of the layout. */
const asideClass = (open: boolean): string =>
  cx('print:hidden w-64 bg-[#1e1e2d] text-slate-100 flex-col justify-between gap-5 shrink-0 border-r border-slate-800 h-screen overflow-y-auto p-4 select-none transition-colors md:static md:flex', open ? 'flex fixed inset-y-0 left-0 z-40 shadow-md' : 'hidden');

/** The drawer closes when a navigation button is pressed (not the switches, and not the buttons that open a menu). */
const closeAfterNavigation = (onClose?: () => void) => (event: React.MouseEvent) => {
  const target = event.target as HTMLElement;
  if (target.closest('button') && !target.closest('[role="group"]') && !target.closest('[data-keep-drawer]')) onClose?.();
};

/** What the sidebar holds: the brand, the account menu, the modules, who rides what, the journey and, for the catalog admin, the admin link. */
const SidebarContent: React.FC<SidebarProps> = ({ t, currentMode, onSelectMode, locale, theme, onSetLocale, onSetTheme, journey, garage = null, onSwitchBike, onAddBike, riders = null }) => (
  <>
    <div className="flex flex-col gap-5">
      <SidebarBrand title={t.common.appTitle} tagline={t.common.tagline} homeLabel={t.shell.sidebar.dashboard} active={currentMode === 'entry'} onHome={() => onSelectMode('entry')} />
      <AccountMenu {...{ t, currentMode, onSelectMode, locale, theme, onSetLocale, onSetTheme }} />
      <MainNav t={t} currentMode={currentMode} onSelectMode={onSelectMode} />
      {onSwitchBike && <RidingNow t={t} garage={garage} riders={riders} onSwitchBike={onSwitchBike} onAddBike={onAddBike} />}
      <JourneyStepper t={t} journey={journey} />
    </div>
    <div className="space-y-2">
      <AdminLink t={t} active={currentMode === 'admin'} onOpen={() => onSelectMode('admin')} />
      <VersionLine t={t} className="text-slate-400" />
    </div>
  </>
);

export const Sidebar: React.FC<SidebarProps> = (props) => (
  <>
    {props.open && <div data-testid="nav-scrim" onClick={props.onClose} className="md:hidden print:hidden fixed inset-0 z-30 bg-scrim" />}
    <aside onClick={closeAfterNavigation(props.onClose)} data-open={props.open || undefined} data-testid="sidebar" className={asideClass(props.open ?? false)}>
      <SidebarContent {...props} />
    </aside>
  </>
);
