'use client';

import React, { useState } from 'react';
import { ListChecks, UserRound, type LucideIcon } from 'lucide-react';
import type { Locale, Translations } from '@/lib/i18n/translations';
import { cx } from '@/lib/classNames';
import { useAuth } from '@/lib/auth/AuthContext';
import { useDismiss } from '@/lib/hooks/useDismiss';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { Segmented } from '@/components/primitives/Segmented';
import type { AppMode, Theme } from './appMode';
import { POPUP_CLASS, PopupCaret, triggerClass } from './popupStyle';

const ITEM = 'w-full text-left rounded-xl px-3 py-2.5 text-sm font-medium flex items-center gap-2.5 hover:bg-sunken disabled:opacity-50 disabled:hover:bg-transparent';

interface MenuProps {
  t: Translations;
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  locale: Locale;
  theme: Theme;
  onSetLocale: (locale: Locale) => void;
  onSetTheme: (theme: Theme) => void;
}

/** A page of the app in the menu: a functional icon next to its text, the current page marked. */
const PageItem: React.FC<{ icon: LucideIcon; label: string; active: boolean; onOpen: () => void }> = ({ icon: Icon, label, active, onOpen }) => (
  <button type="button" role="menuitem" aria-current={active ? 'page' : undefined} onClick={onOpen} className={cx(ITEM, active ? 'text-accent-ink' : 'text-ink')}>
    <Icon aria-hidden="true" className="w-4 h-4 shrink-0" />
    {label}
  </button>
);

/** A setting of the app: its name and the switch. */
const SettingRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-center justify-between gap-3 px-3 py-1.5 text-sm text-ink">
    <span className="min-w-0">{label}</span>
    {children}
  </div>
);

/** What the guest and the signed in rider see at the end of the menu: signing in (a dialog), signing out, or the disabled "soon" without a database. */
const SessionItem: React.FC<{ t: Translations; onClose: () => void }> = ({ t, onClose }) => {
  const auth = useAuth();
  const [dialog, setDialog] = useState(false);
  if (!auth.configured || auth.status === 'loading') return <button type="button" role="menuitem" disabled className={ITEM}>{t.navigation.signInSoon}</button>;
  if (auth.status === 'authenticated') return <button type="button" role="menuitem" onClick={() => { onClose(); void auth.signOut(); }} className={cx(ITEM, 'text-tone-danger-ink')}>{t.auth.signOut}</button>;
  return (
    <>
      <button type="button" role="menuitem" onClick={() => setDialog(true)} className={ITEM}>{t.auth.signIn}</button>
      <AuthDialog t={t} open={dialog} onClose={() => { setDialog(false); onClose(); }} />
    </>
  );
};

/** The popup of the account menu: the pages of the account, then the settings, then the session. */
const MenuPopup: React.FC<MenuProps & { signedIn: boolean; onClose: () => void }> = ({ t, currentMode, onSelectMode, locale, theme, onSetLocale, onSetTheme, signedIn, onClose }) => {
  const open = (mode: AppMode) => () => { onClose(); onSelectMode(mode); };
  return (
    <div role="menu" aria-label={t.shell.sidebar.accountMenu} className={POPUP_CLASS}>
      <PopupCaret />
      {signedIn && <PageItem icon={UserRound} label={t.navigation.myProfile} active={currentMode === 'profile'} onOpen={open('profile')} />}
      <PageItem icon={ListChecks} label={t.navigation.capabilities} active={currentMode === 'capabilities'} onOpen={open('capabilities')} />
      <div className="my-1.5 border-t border-line" />
      <SettingRow label={t.navigation.languageLabel}>
        <Segmented compact label={t.navigation.languageLabel} options={[{ value: 'en', text: 'EN' }, { value: 'cs', text: 'CS' }]} value={locale} onChange={onSetLocale} />
      </SettingRow>
      <SettingRow label={t.navigation.themeLabel}>
        <Segmented compact label={t.navigation.themeLabel} options={[{ value: 'light', text: t.navigation.themeLight }, { value: 'dark', text: t.navigation.themeDark }]} value={theme} onChange={onSetTheme} />
      </SettingRow>
      <div className="my-1.5 border-t border-line" />
      <SessionItem t={t} onClose={onClose} />
    </div>
  );
};

/** The account row at the top of the sidebar: who is signed in (or the guest) and a menu with the profile, the settings and the session. */
export const AccountMenu: React.FC<MenuProps> = (props) => {
  const { t } = props;
  const auth = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));
  const signedIn = auth.configured && auth.status === 'authenticated';
  const line = signedIn ? auth.user?.email ?? '' : auth.configured && auth.status === 'anonymous' ? t.shell.sidebar.signInToSave : t.navigation.signInSoon;
  return (
    <div ref={ref} className="relative" data-testid="account-menu">
      <button type="button" aria-haspopup="menu" aria-expanded={open} data-keep-drawer onClick={() => setOpen(!open)} className={triggerClass(open)}>
        <span className="min-w-0">
          <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">{signedIn ? t.shell.sidebar.accountLabel : t.navigation.guestLabel}</span>
          <span className="block truncate text-xs font-bold text-white" title={line}>{line}</span>
        </span>
        <span aria-hidden="true" className="text-[10px] text-slate-300">{open ? '▴' : '▾'}</span>
      </button>
      {open && <MenuPopup {...props} signedIn={signedIn} onClose={() => setOpen(false)} />}
    </div>
  );
};
