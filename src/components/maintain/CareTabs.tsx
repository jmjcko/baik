import React from 'react';
import { BookOpen, Wrench, type LucideIcon } from 'lucide-react';
import { cx } from '@/lib/classNames';
import type { Translations } from '@/lib/i18n/translations';

export type CareTab = 'workshop' | 'garage';

const TABS: CareTab[] = ['workshop', 'garage'];

const ICONS: Record<CareTab, LucideIcon> = { workshop: Wrench, garage: BookOpen };

interface TabsProps {
  t: Translations;
  active: CareTab;
  onChange: (tab: CareTab) => void;
}

/** The two sections of bAIkcare: the Workshop and the Garage with the service book. */
export const CareTabs: React.FC<TabsProps> = ({ t, active, onChange }) => (
  <div role="tablist" aria-label={t.service.tabs.label} className="inline-flex gap-1 rounded-full border border-line bg-sunken p-1">
    {TABS.map((tab) => {
      const Icon = ICONS[tab];
      return (
      <button key={tab} type="button" role="tab" id={`care-tab-${tab}`} aria-selected={active === tab} aria-controls={`care-panel-${tab}`} onClick={() => onChange(tab)} data-testid={`care-tab-${tab}`} className={cx('h-11 px-5 rounded-full text-sm font-bold transition-colors inline-flex items-center gap-2', active === tab ? 'bg-blue-600 text-slate-50 shadow-sm' : 'text-ink-2 hover:text-ink hover:bg-surface')}>
        <Icon aria-hidden="true" className="w-4 h-4" />
        {t.service.tabs[tab]}
      </button>
      );
    })}
  </div>
);
