import React from 'react';
import { cx } from '@/lib/classNames';
import type { Translations } from '@/lib/i18n/translations';

export type CareTab = 'workshop' | 'garage';

const TABS: CareTab[] = ['workshop', 'garage'];

interface TabsProps {
  t: Translations;
  active: CareTab;
  onChange: (tab: CareTab) => void;
}

/** The two sections of bAIkcare: the Workshop and the Garage with the service book. */
export const CareTabs: React.FC<TabsProps> = ({ t, active, onChange }) => (
  <div role="tablist" aria-label={t.service.tabs.label} className="inline-flex gap-1 rounded-full border border-line bg-sunken p-1 print:hidden">
    {TABS.map((tab) => (
      <button key={tab} type="button" role="tab" id={`care-tab-${tab}`} aria-selected={active === tab} aria-controls={`care-panel-${tab}`} onClick={() => onChange(tab)} data-testid={`care-tab-${tab}`} className={cx('h-10 px-5 rounded-full text-sm font-semibold transition-colors', active === tab ? 'bg-surface text-ink shadow-sm' : 'text-ink-2 hover:text-ink')}>
        {t.service.tabs[tab]}
      </button>
    ))}
  </div>
);
