import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import type { HowTo } from './buildHowTo';
import { StepIllustration } from './StepIllustration';

type HowToTexts = Translations['diagnosticReport']['howTo'];

const SECTION_LABEL = 'text-xs font-semibold uppercase tracking-wide text-ink-3 mb-1.5';

const Section: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <h4 className={SECTION_LABEL}>{label}</h4>
    {children}
  </div>
);

interface NoteProps {
  label: string;
  text: string;
  className: string;
  labelClass: string;
}

const Note: React.FC<NoteProps> = ({ label, text, className, labelClass }) => (
  <p className={`leading-relaxed ${className}`}>
    <span className={`font-semibold ${labelClass}`}>{label}: </span>
    {text}
  </p>
);

const GuideBody: React.FC<{ h: HowToTexts; guide: HowTo }> = ({ h, guide }) => (
  <div className="px-4 pb-4 space-y-4 text-sm text-ink-2">
    <Section label={h.toolsLabel}>
      <ul className="list-disc pl-5 space-y-0.5">
        {guide.tools.map((tool) => (
          <li key={tool}>{tool}</li>
        ))}
      </ul>
    </Section>
    <Section label={h.referenceLabel}>
      <p className="p-3 rounded-lg border border-tone-info-line bg-tone-info-bg leading-relaxed">{guide.reference}</p>
    </Section>
    <Section label={h.stepsLabel}>
      <ol className="space-y-3">
        {guide.steps.map((step, index) => (
          <li key={step} className="flex items-start gap-3 leading-relaxed">
            <span aria-hidden="true" className="shrink-0 w-6 h-6 rounded-full bg-blue-600 text-slate-50 text-xs font-bold flex items-center justify-center">
              {index + 1}
            </span>
            {guide.stepKinds?.[index] && <StepIllustration kind={guide.stepKinds[index]} />}
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>
    </Section>
    {guide.tip && <Note label={h.tipLabel} text={guide.tip} className="" labelClass="text-teal-ink" />}
    <Note label={h.safetyLabel} text={h.safety} className="p-3 rounded-lg border border-tone-warning-line bg-tone-warning-bg text-tone-warning-ink" labelClass="" />
  </div>
);

/** Expandable "how to do it on your bike" guide: tools, exact measuring point, safe procedure and safety line. */
export const HowToGuide: React.FC<{ t: Translations; id: string; guide: HowTo; defaultOpen?: boolean }> = ({ t, id, guide, defaultOpen }) => {
  const h = t.diagnosticReport.howTo;
  return (
    <details data-testid={`howto-${id}`} open={defaultOpen} className="group mt-5 rounded-xl border border-line bg-surface">
      <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between gap-3 text-sm font-bold text-ink">
        <span>{h.title}</span>
        <span aria-hidden="true" className="text-ink-3 text-sm transition-transform group-open:rotate-180">▾</span>
      </summary>
      <GuideBody h={h} guide={guide} />
    </details>
  );
};
