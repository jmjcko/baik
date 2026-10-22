import React from 'react';
import { cx } from '@/lib/classNames';
import type { Locale } from '@/lib/i18n/translations';

export type ThemeMode = 'light' | 'dark' | 'both';

export const SECTIONS = [
  { id: 'targets', label: 'Targets' },
  { id: 'schematics', label: 'Schematics' },
  { id: 'guides', label: 'Guides' },
  { id: 'diagnosis', label: 'Diagnosis' },
  { id: 'studio', label: 'Studio' },
] as const;

interface SegmentedProps<T extends string> {
  label: string;
  options: Array<{ value: T; text: string }>;
  value: T;
  onChange: (value: T) => void;
}

/** Pill-shaped segmented switch used for theme and language. */
function Segmented<T extends string>({ label, options, value, onChange }: SegmentedProps<T>) {
  return (
    <div role="group" aria-label={label} className="flex items-center gap-2">
      <span className="text-xs font-mono uppercase tracking-wide text-ink-3">{label}</span>
      <div className="flex rounded-full border border-line bg-sunken p-0.5">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={cx('h-9 px-4 rounded-full text-xs font-semibold transition-colors', value === option.value ? 'bg-blue-600 text-slate-50' : 'text-ink-2 hover:text-ink')}
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
}

interface ShowcaseToolbarProps {
  theme: ThemeMode;
  onTheme: (mode: ThemeMode) => void;
  locale: Locale;
  onLocale: (locale: Locale) => void;
}

/** Sticky toolbar: three-way theme switch (light, dark, side by side), language switch and section links. */
export const ShowcaseToolbar: React.FC<ShowcaseToolbarProps> = ({ theme, onTheme, locale, onLocale }) => (
  <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
    <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
      <h1 className="text-sm font-extrabold tracking-tight text-ink">bAIk component showcase</h1>
      <Segmented label="Theme" value={theme} onChange={onTheme} options={[{ value: 'light', text: 'Light' }, { value: 'dark', text: 'Dark' }, { value: 'both', text: 'Side by side' }]} />
      <Segmented label="Language" value={locale} onChange={onLocale} options={[{ value: 'en', text: 'EN' }, { value: 'cs', text: 'CS' }]} />
      <nav aria-label="Sections" className="flex flex-wrap gap-x-4 text-sm">
        {SECTIONS.map((section) => (
          <a key={section.id} href={`#${section.id}`} className="font-semibold text-accent-ink hover:underline">
            {section.label}
          </a>
        ))}
      </nav>
    </div>
  </header>
);
