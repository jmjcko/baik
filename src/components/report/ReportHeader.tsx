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
  /** Scrolls to a section of the report by its element id. */
  onJump: (id: string) => void;
  onEditMeasurements: () => void;
  onOpenCadStudio: () => void;
  onExportPdf: () => void;
}

const JumpNav: React.FC<{ t: Translations; showReasons: boolean; onJump: (id: string) => void }> = ({ t, showReasons, onJump }) => {
  const j = t.diagnosticReport.jump;
  const items = [
    { id: 'report-plan', text: j.plan, shown: true },
    { id: 'report-reasons', text: j.reasons, shown: showReasons },
    { id: 'report-details', text: j.details, shown: true },
    { id: 'report-numbers', text: j.numbers, shown: true },
  ];
  return (
    <nav aria-label={j.label} className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-4 text-sm">
      <span className="text-ink-3">{j.label}:</span>
      {items.filter((item) => item.shown).map((item) => (
        <button key={item.id} type="button" onClick={() => onJump(item.id)} className="font-semibold text-accent-ink hover:underline">
          {item.text}
        </button>
      ))}
    </nav>
  );
};

/** Friendly page header: title, one-sentence summary, what the report contains and the two main actions. */
export const ReportHeader: React.FC<ReportHeaderProps> = ({ t, stepCount, linkedSymptomCount, onJump, onEditMeasurements, onOpenCadStudio, onExportPdf }) => {
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
        <JumpNav t={t} showReasons={linkedSymptomCount > 0} onJump={onJump} />
      </div>
      <div className="flex flex-wrap gap-3 shrink-0">
        <button onClick={onEditMeasurements} className={`${PILL} border border-line bg-surface text-ink hover:bg-sunken`}>
          {r.editInputsButton}
        </button>
        <button onClick={onExportPdf} className={`${PILL} border border-line bg-surface text-ink hover:bg-sunken`}>
          {r.exportPdfButton}
        </button>
        <button onClick={onOpenCadStudio} className={`${PILL} bg-blue-600 hover:bg-blue-700 text-slate-50 shadow-sm`}>
          {r.openCadButton}
        </button>
      </div>
    </header>
  );
};
