import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import type { ActionStep } from './buildActionPlan';

/** Numbered, prioritized plan of adjustments, directly under the KPI metrics. */
export const ActionPlan: React.FC<{ t: Translations; steps: ActionStep[] }> = ({ t, steps }) => {
  const p = t.diagnosticReport.actionPlan;
  return (
    <section data-testid="action-plan" className="p-6 rounded-2xl border border-line bg-surface shadow-sm">
      <h2 className="text-lg font-bold text-ink tracking-tight">{p.title}</h2>
      <p className="text-xs text-ink-3 mt-1 mb-5">{p.subtitle}</p>
      <ol className="space-y-4">
        {steps.map((step, index) => (
          <li key={step.id} data-testid={`action-step-${step.id}`} className="flex gap-4">
            <span className="font-mono text-2xl font-bold text-accent-ink leading-none w-6 shrink-0" aria-hidden="true">
              {index + 1}
            </span>
            <div>
              <h3 className="text-sm font-bold text-ink">
                <span className="sr-only">{fill(p.stepLabel, { n: index + 1 })}: </span>
                {step.title}
              </h3>
              <p className="text-xs text-ink-2 leading-relaxed mt-0.5">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
};
