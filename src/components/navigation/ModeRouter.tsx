'use client';

import React from 'react';
import { Translations } from '@/lib/i18n/translations';

export type AppMode = 'entry' | 'wizard' | 'report' | 'studio' | 'prepurchasing';

interface ModeRouterProps {
  t: Translations;
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
}

type Accent = 'blue' | 'teal';

const ACCENT_STYLES: Record<Accent, { badge: string; step: string; button: string }> = {
  blue: {
    badge: 'text-blue-700 bg-blue-50 border border-blue-200',
    step: 'border-blue-200 bg-blue-50 text-blue-700',
    button: 'bg-blue-600 hover:bg-blue-700',
  },
  teal: {
    badge: 'text-teal-700 bg-teal-50 border border-teal-200',
    step: 'border-teal-200 bg-teal-50 text-teal-700',
    button: 'bg-teal-600 hover:bg-teal-700',
  },
};

interface PathCardProps {
  accent: Accent;
  badge: string;
  title: string;
  subtitle: string;
  steps: string[];
  buttonLabel: string;
  onSelect: () => void;
}

const PathSteps: React.FC<{ steps: string[]; stepClass: string }> = ({ steps, stepClass }) => (
  <div className="flex flex-col gap-3 mb-8 text-sm text-slate-700">
    {steps.map((step, idx) => (
      <div key={idx} className="flex items-start gap-3">
        <span className={`w-6 h-6 rounded-full border text-center leading-6 text-xs font-bold shrink-0 ${stepClass}`}>
          {idx + 1}
        </span>
        <span className="pt-0.5 leading-snug">{step}</span>
      </div>
    ))}
  </div>
);

const PathCard: React.FC<PathCardProps> = ({ accent, badge, title, subtitle, steps, buttonLabel, onSelect }) => {
  const styles = ACCENT_STYLES[accent];
  return (
    <div className="flex flex-col justify-between p-8 rounded-2xl border border-slate-200/80 hover:border-slate-300 bg-white transition-all duration-200 shadow-sm hover:shadow-md">
      <div>
        <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide mb-4 ${styles.badge}`}>
          {badge}
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">{title}</h2>
        <p className="text-slate-600 text-sm leading-relaxed mb-6">{subtitle}</p>
        <PathSteps steps={steps} stepClass={styles.step} />
      </div>
      <button
        onClick={onSelect}
        className={`w-full h-12 rounded-full font-semibold text-sm tracking-wide text-white transition-all shadow-sm active:scale-[0.99] flex items-center justify-center cursor-pointer ${styles.button}`}
      >
        {buttonLabel}
      </button>
    </div>
  );
};

const RouterHeader: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div className="text-center mb-10">
    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">{title}</h1>
    <p className="text-slate-600 max-w-2xl mx-auto text-base leading-relaxed">{subtitle}</p>
  </div>
);

export const ModeRouter: React.FC<ModeRouterProps> = ({ t, onSelectMode }) => {
  const r = t.entryRouter;
  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <RouterHeader title={r.title} subtitle={r.subtitle} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <PathCard
          accent="blue"
          badge={r.pathABadge}
          title={r.pathATitle}
          subtitle={r.pathASubtitle}
          steps={r.pathASteps}
          buttonLabel={r.pathAButton}
          onSelect={() => onSelectMode('wizard')}
        />
        <PathCard
          accent="teal"
          badge={r.pathBBadge}
          title={r.pathBTitle}
          subtitle={r.pathBSubtitle}
          steps={r.pathBSteps}
          buttonLabel={r.pathBButton}
          onSelect={() => onSelectMode('prepurchasing')}
        />
      </div>
    </div>
  );
};
