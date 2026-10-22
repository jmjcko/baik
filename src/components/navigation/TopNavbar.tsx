'use client';

import React from 'react';
import { Locale, Translations } from '@/lib/i18n/translations';
import { BaikLogo } from '@/components/branding/BaikLogo';

interface TopNavbarProps {
  locale: Locale;
  theme: 'dark' | 'light';
  t: Translations;
  onToggleLocale: () => void;
  onToggleTheme: () => void;
  onSelectBaikfit: () => void;
}

const PILL_BASE = 'text-xs font-mono rounded-full border bg-slate-50 hover:bg-slate-100 transition-colors shadow-xs';

const MobileBrand: React.FC<{ theme: TopNavbarProps['theme']; onClick: () => void }> = ({ theme, onClick }) => (
  <button
    onClick={onClick}
    className="md:hidden flex items-center gap-1.5 font-mono font-extrabold text-lg text-slate-900 focus:outline-none"
    aria-label="bAIk Home"
  >
    <BaikLogo variant={theme === 'dark' ? 'dark' : 'light'} size={26} />
    <span>bAIk</span>
  </button>
);

const Greeting: React.FC<{ greeting: string; tagline: string }> = ({ greeting, tagline }) => (
  <div>
    <h1 className="text-sm md:text-base font-bold text-slate-900 tracking-tight">{greeting}</h1>
    <p className="text-[11px] text-slate-500 hidden sm:block">{tagline}</p>
  </div>
);

const SearchBox: React.FC<{ placeholder: string }> = ({ placeholder }) => (
  <div className="hidden md:flex items-center">
    <div className="relative w-64 lg:w-80">
      <input
        type="text"
        placeholder={placeholder}
        className="w-full py-1.5 px-4 text-xs bg-slate-100/90 border border-slate-200 rounded-full text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        aria-label="Search"
      />
    </div>
  </div>
);

const Controls: React.FC<Pick<TopNavbarProps, 'locale' | 'theme' | 't' | 'onToggleLocale' | 'onToggleTheme'>> = ({
  locale,
  theme,
  t,
  onToggleLocale,
  onToggleTheme,
}) => (
  <div className="flex items-center gap-2.5">
    <button
      onClick={onToggleLocale}
      className={`px-3.5 py-1.5 font-bold tracking-wider border-slate-200 text-slate-800 ${PILL_BASE}`}
      aria-label="Toggle language"
    >
      {locale === 'en' ? 'EN | cs' : 'cs | EN'}
    </button>
    <button
      onClick={onToggleTheme}
      className={`px-3 py-1.5 border-slate-200 hover:border-slate-300 text-slate-600 ${PILL_BASE}`}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? t.navigation.themeDark : t.navigation.themeLight}
    </button>
  </div>
);

export const TopNavbar: React.FC<TopNavbarProps> = ({ locale, theme, t, onToggleLocale, onToggleTheme, onSelectBaikfit }) => (
  <header className="w-full bg-white border-b border-slate-200/80 px-6 py-3.5 sticky top-0 z-30 shadow-xs flex items-center justify-between gap-4 transition-colors">
    <div className="flex items-center gap-3">
      <MobileBrand theme={theme} onClick={onSelectBaikfit} />
      <Greeting greeting={t.dashboard.greeting} tagline={t.common.tagline} />
    </div>
    <SearchBox placeholder={t.dashboard.searchPlaceholder} />
    <Controls locale={locale} theme={theme} t={t} onToggleLocale={onToggleLocale} onToggleTheme={onToggleTheme} />
  </header>
);
