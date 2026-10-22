'use client';

import React from 'react';
import type { Locale, Translations } from '@/lib/i18n/translations';
import { cx } from '@/lib/classNames';

export type Theme = 'dark' | 'light';

interface SidebarControlsProps {
  t: Translations;
  locale: Locale;
  theme: Theme;
  onSetLocale: (locale: Locale) => void;
  onSetTheme: (theme: Theme) => void;
}

interface SegmentedProps<T extends string> {
  label: string;
  options: Array<{ value: T; text: string }>;
  value: T;
  onChange: (value: T) => void;
}

const SECTION_LABEL = 'text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold px-1';

/** Pill-shaped segmented switch (text only, no icons). */
function Segmented<T extends string>({ label, options, value, onChange }: SegmentedProps<T>) {
  return (
    <div role="group" aria-label={label} className="flex flex-col gap-1.5">
      <span className={SECTION_LABEL}>{label}</span>
      <div className="flex rounded-full bg-slate-900/60 border border-slate-700/60 p-0.5">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={cx(
              'flex-1 h-10 rounded-full text-xs font-mono font-semibold transition-colors',
              value === option.value ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            )}
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
}

const GuestBlock: React.FC<{ guest: string; signIn: string }> = ({ guest, signIn }) => (
  <div className="rounded-2xl bg-[#282a3c] border border-slate-700/60 p-3 flex items-center justify-between gap-3">
    <span className="text-xs font-bold text-white tracking-wide">{guest}</span>
    <button
      type="button"
      disabled
      className="h-10 px-4 shrink-0 whitespace-nowrap rounded-full border border-slate-600 text-xs font-semibold text-slate-400 cursor-not-allowed"
    >
      {signIn}
    </button>
  </div>
);

/** System controls at the bottom of the left sidebar: language, theme and the guest placeholder. */
export const SidebarControls: React.FC<SidebarControlsProps> = ({ t, locale, theme, onSetLocale, onSetTheme }) => (
  <div className="flex flex-col gap-4">
    <Segmented
      label={t.navigation.languageLabel}
      options={[{ value: 'en', text: 'EN' }, { value: 'cs', text: 'CS' }]}
      value={locale}
      onChange={onSetLocale}
    />
    <Segmented
      label={t.navigation.themeLabel}
      options={[{ value: 'light', text: t.navigation.themeLight }, { value: 'dark', text: t.navigation.themeDark }]}
      value={theme}
      onChange={onSetTheme}
    />
    <GuestBlock guest={t.navigation.guestLabel} signIn={t.navigation.signInSoon} />
  </div>
);
