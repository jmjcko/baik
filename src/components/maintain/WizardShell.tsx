import React, { useState } from 'react';
import { ArrowLeft, TriangleAlert } from 'lucide-react';
import type { WizardStepTexts } from '@/lib/i18n/types/workshop';
import { fill } from '@/lib/i18n/format';
import { SurfaceCard } from '@/components/primitives/SurfaceCard';
import { cx } from '@/lib/classNames';

export interface WizardLabels {
  back: string;
  next: string;
  previous: string;
  finish: string;
  stepOf: string;
}

interface WizardShellProps {
  testId: string;
  title: string;
  intro: string;
  steps: WizardStepTexts[];
  labels: WizardLabels;
  diagram: (step: number) => React.ReactNode;
  /** Extra content of a step (a choice the rider has to make). */
  extra?: (step: number) => React.ReactNode;
  /** Why the rider cannot go on yet; null when the step can be left. */
  blocker?: (step: number) => string | null;
  onClose: () => void;
}

const PILL = 'h-12 px-6 rounded-full text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

const Progress: React.FC<{ step: number; total: number; label: string }> = ({ step, total, label }) => (
  <div className="space-y-2">
    <p className="text-xs font-bold uppercase tracking-wider text-ink-3" data-testid="wizard-progress">{fill(label, { n: step + 1, total })}</p>
    <div className="flex gap-1.5" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => <span key={i} className={cx('h-1.5 flex-1 rounded-full', i <= step ? 'bg-blue-600' : 'bg-sunken')} />)}
    </div>
  </div>
);

const StepCard: React.FC<{ step: WizardStepTexts }> = ({ step }) => (
  <div className="space-y-3">
    <h3 className="text-base font-bold text-ink">{step.title}</h3>
    <p className="text-sm text-ink-2 leading-relaxed">{step.body}</p>
    <ul className="space-y-1.5 list-disc pl-5 text-sm text-ink leading-relaxed">
      {step.points.map((point) => <li key={point}>{point}</li>)}
    </ul>
    {step.warning && (
      <p className="flex gap-2 rounded-xl border-2 border-tone-warning-line bg-tone-warning-bg p-3 text-sm font-semibold text-tone-warning-ink" data-testid="wizard-warning">
        <TriangleAlert aria-hidden="true" className="w-4 h-4 shrink-0 mt-0.5" />
        {step.warning}
      </p>
    )}
  </div>
);

interface NavProps {
  labels: WizardLabels;
  first: boolean;
  last: boolean;
  blocker: string | null;
  onPrevious: () => void;
  onNext: () => void;
}

const StepNav: React.FC<NavProps> = ({ labels, first, last, blocker, onPrevious, onNext }) => (
  <div className="space-y-2">
    {blocker && <p className="text-sm font-semibold text-tone-warning-ink" role="status" data-testid="wizard-blocker">{blocker}</p>}
    <div className="flex flex-wrap gap-3">
      <button type="button" disabled={first} onClick={onPrevious} data-testid="wizard-previous" className={cx(PILL, 'border border-line bg-surface text-ink-2 hover:bg-sunken')}>{labels.previous}</button>
      <button type="button" disabled={!!blocker} onClick={onNext} data-testid="wizard-next" className={cx(PILL, 'bg-blue-600 text-slate-50 hover:bg-blue-700')}>{last ? labels.finish : labels.next}</button>
    </div>
  </div>
);

/** The frame of a workshop guide: the progress, one step with its drawing, and the buttons to move between the steps. */
export const WizardShell: React.FC<WizardShellProps> = ({ testId, title, intro, steps, labels, diagram, extra, blocker, onClose }) => {
  const [step, setStep] = useState(0);
  const last = step === steps.length - 1;
  return (
    <SurfaceCard as="section" padding="lg" className="space-y-5" testId={testId}>
      <button type="button" onClick={onClose} data-testid="wizard-back" className="inline-flex items-center gap-2 text-sm font-semibold text-accent-ink">
        <ArrowLeft aria-hidden="true" className="w-4 h-4" />
        {labels.back}
      </button>
      <div>
        <h2 className="text-lg font-bold text-ink tracking-tight">{title}</h2>
        <p className="text-sm text-ink-2 leading-relaxed mt-1">{intro}</p>
      </div>
      <Progress step={step} total={steps.length} label={labels.stepOf} />
      <div className="grid gap-5 md:grid-cols-2 items-start">
        <div className="space-y-4">
          <StepCard step={steps[step]} />
          {extra?.(step)}
        </div>
        {diagram(step)}
      </div>
      <StepNav labels={labels} first={step === 0} last={last} blocker={blocker?.(step) ?? null} onPrevious={() => setStep(step - 1)} onNext={() => (last ? onClose() : setStep(step + 1))} />
    </SurfaceCard>
  );
};
