import React from 'react';
import type { WizardStepNumber } from '@/lib/hooks/useJourney';

const PROGRESS_BY_STEP: Record<WizardStepNumber, string> = { 1: '25%', 2: '50%', 3: '75%', 4: '100%' };

/** Heading of a wizard step: bold title and a short explanation. */
export const StepHeading: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div>
    <h2 className="text-2xl font-bold text-ink mb-1.5 tracking-tight">{title}</h2>
    <p className="text-ink-3 text-sm leading-relaxed">{subtitle}</p>
  </div>
);

export const WizardProgress: React.FC<{ step: WizardStepNumber; label: string }> = ({ step, label }) => (
  <div className="mb-8">
    <div className="flex items-center justify-between text-sm font-medium text-ink-2 mb-2">
      <span>{label}</span>
      <span className="text-xs font-mono text-ink-3 font-semibold">{PROGRESS_BY_STEP[step]}</span>
    </div>
    <div className="w-full bg-sunken h-2 rounded-full overflow-hidden border border-line">
      <div
        className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
        style={{ width: PROGRESS_BY_STEP[step] }}
      />
    </div>
  </div>
);

interface WizardActionsProps {
  backLabel: string;
  nextLabel: string;
  onBack: () => void;
  onNext: () => void;
}

export const WizardActions: React.FC<WizardActionsProps> = ({ backLabel, nextLabel, onBack, onNext }) => (
  <div className="flex items-center justify-between pt-8 border-t border-line mt-8">
    <button
      onClick={onBack}
      className="h-12 px-6 rounded-full font-medium text-sm text-ink-2 hover:text-ink border border-line hover:border-line bg-surface hover:bg-sunken transition-colors shadow-sm"
    >
      {backLabel}
    </button>
    <button
      onClick={onNext}
      className="h-12 px-8 rounded-full font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-slate-50 transition-all shadow-md active:scale-[0.99] flex items-center justify-center"
    >
      {nextLabel}
    </button>
  </div>
);
