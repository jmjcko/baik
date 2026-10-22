import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';

const PILL = 'h-12 px-6 rounded-full text-sm font-semibold transition-colors active:scale-[0.99] inline-flex items-center justify-center';

const Chip: React.FC<{ text: string }> = ({ text }) => (
  <span className="inline-flex items-center h-8 px-3 rounded-full border border-line bg-surface text-xs font-semibold text-ink-2">{text}</span>
);

interface ReportHeaderProps {
  t: Translations;
  stepCount: number;
  linkedSymptomCount: number;
  onEditMeasurements: () => void;
  onOpenCadStudio: () => void;
}

/** Friendly page header: title, one-sentence summary, what the report contains and the two main actions. */
export const ReportHeader: React.FC<ReportHeaderProps> = ({ t, stepCount, linkedSymptomCount, onEditMeasurements, onOpenCadStudio }) => {
  const r = t.diagnosticReport;
  return (
    <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold text-accent-ink mb-1">{r.auditBadge}</p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-ink tracking-tight">{r.title}</h1>
        <p className="text-ink-2 text-base mt-2 leading-relaxed">{r.subtitle}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          <Chip text={fill(r.summarySteps, { n: stepCount })} />
          {linkedSymptomCount > 0 && <Chip text={fill(r.summarySymptoms, { n: linkedSymptomCount })} />}
        </div>
      </div>
      <div className="flex flex-wrap gap-3 shrink-0">
        <button onClick={onEditMeasurements} className={`${PILL} border border-line bg-surface text-ink hover:bg-sunken`}>
          {r.editInputsButton}
        </button>
        <button onClick={onOpenCadStudio} className={`${PILL} bg-blue-600 hover:bg-blue-700 text-slate-50 shadow-sm`}>
          {r.openCadButton}
        </button>
      </div>
    </header>
  );
};
