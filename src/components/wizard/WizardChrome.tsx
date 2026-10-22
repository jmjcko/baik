import React from 'react';

export type WizardStepNumber = 1 | 2 | 3 | 4;

const PROGRESS_BY_STEP: Record<WizardStepNumber, string> = { 1: '25%', 2: '50%', 3: '75%', 4: '100%' };

/** Heading of a wizard step: bold title and a short explanation. */
export const StepHeading: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div>
    <h2 className="text-2xl font-bold text-slate-900 mb-1.5 tracking-tight">{title}</h2>
    <p className="text-slate-500 text-sm leading-relaxed">{subtitle}</p>
  </div>
);

export const WizardProgress: React.FC<{ step: WizardStepNumber; label: string }> = ({ step, label }) => (
  <div className="mb-8">
    <div className="flex items-center justify-between text-sm font-medium text-slate-700 mb-2">
      <span>{label}</span>
      <span className="text-xs font-mono text-slate-500 font-semibold">{PROGRESS_BY_STEP[step]}</span>
    </div>
    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden border border-slate-300">
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
  <div className="flex items-center justify-between pt-8 border-t border-slate-200 mt-8">
    <button
      onClick={onBack}
      className="h-12 px-6 rounded-full font-medium text-sm text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-colors shadow-sm"
    >
      {backLabel}
    </button>
    <button
      onClick={onNext}
      className="h-12 px-8 rounded-full font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md active:scale-[0.99] flex items-center justify-center"
    >
      {nextLabel}
    </button>
  </div>
);
