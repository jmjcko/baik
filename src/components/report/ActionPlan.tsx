import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { IllustrationToggle } from '@/components/illustrations/ExplainerImage';
import type { ActionStep } from './buildActionPlan';

/** Numbered, prioritized plan of adjustments, directly under the KPI metrics. */
interface ActionPlanProps {
  t: Translations;
  steps: ActionStep[];
  /** Scrolls to the detail card of a step. */
  onShowDetail: (id: ActionStep['id']) => void;
}

const Reason: React.FC<{ label: string; text: string }> = ({ label, text }) => (
  <p className="text-xs text-ink-3 leading-relaxed mt-0.5" data-testid="reason"><span className="font-semibold text-teal-ink">{label}: </span>{text}</p>
);

interface StepItemProps {
  t: Translations;
  step: ActionStep;
  index: number;
  onShowDetail: (id: ActionStep['id']) => void;
}

const StepItem: React.FC<StepItemProps> = ({ t, step, index, onShowDetail }) => {
  const p = t.diagnosticReport.actionPlan;
  return (
    <li data-testid={`action-step-${step.id}`} className="flex gap-4">
      <span className="font-mono text-2xl font-bold text-accent-ink leading-none w-6 shrink-0" aria-hidden="true">
        {index + 1}
      </span>
      <div>
        <h3 className="text-sm font-bold text-ink">
          <span className="sr-only">{fill(p.stepLabel, { n: index + 1 })}: </span>
          {step.title}
        </h3>
        <p className="text-xs text-ink-2 leading-relaxed mt-0.5">{step.body}</p>
        <Reason label={t.diagnosticReport.reasons.label} text={step.reason} />
        {step.illustration && <IllustrationToggle id={step.illustration} label={t.diagnosticReport.illustrations.show} alt={t.diagnosticReport.illustrations[step.illustration].alt} caption={t.diagnosticReport.illustrations[step.illustration].caption} />}
        {step.hasDetail !== false && (
          <button type="button" onClick={() => onShowDetail(step.id)} className="mt-1 text-xs font-semibold text-accent-ink hover:underline">
            {p.showDetail}
          </button>
        )}
      </div>
    </li>
  );
};

export const ActionPlan: React.FC<ActionPlanProps> = ({ t, steps, onShowDetail }) => {
  const p = t.diagnosticReport.actionPlan;
  return (
    <section id="report-plan" data-testid="action-plan" className="p-6 rounded-2xl border border-line bg-surface shadow-sm">
      <h2 className="text-lg font-bold text-ink tracking-tight">{p.title}</h2>
      <p className="text-xs text-ink-3 mt-1 mb-5">{p.subtitle}</p>
      <ol className="space-y-4">
        {steps.map((step, index) => <StepItem key={step.id} t={t} step={step} index={index} onShowDetail={onShowDetail} />)}
      </ol>
    </section>
  );
};
