import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';

const PILL = 'h-12 px-6 rounded-full text-sm font-semibold transition-colors active:scale-[0.99] inline-flex items-center justify-center';

interface SummaryProps {
  t: Translations;
  stepCount: number;
  linkedSymptomCount: number;
  /** The fit of the stock bike to the rider ("Match with your body 92 %"); none without a stock bike. */
  fitScore: string | null;
  onEditMeasurements: () => void;
  onOpenCadStudio: () => void;
  onExportPdf: () => void;
}

const Line: React.FC<{ text: string }> = ({ text }) => <li className="text-sm font-semibold text-ink">{text}</li>;

/** The card beside the report: what the report holds in three lines and the three actions. It stays in view on a wide screen and comes first on a narrow one. */
export const ReportSummary: React.FC<SummaryProps> = ({ t, stepCount, linkedSymptomCount, fitScore, onEditMeasurements, onOpenCadStudio, onExportPdf }) => {
  const r = t.diagnosticReport;
  return (
    <section data-testid="report-summary" aria-label={r.summaryTitle} className="rounded-2xl border border-line bg-surface shadow-sm p-5 space-y-4">
      <p className="text-xs font-bold uppercase tracking-wider text-ink-3">{r.summaryTitle}</p>
      <ul className="space-y-1.5">
        <Line text={fill(r.summarySteps, { n: stepCount })} />
        {linkedSymptomCount > 0 && <Line text={fill(r.summarySymptoms, { n: linkedSymptomCount })} />}
        {fitScore && <Line text={fitScore} />}
      </ul>
      <div className="flex flex-col gap-2">
        <button type="button" onClick={onOpenCadStudio} className={`${PILL} bg-blue-600 hover:bg-blue-700 text-slate-50 shadow-sm`}>{r.openCadButton}</button>
        <button type="button" onClick={onEditMeasurements} className={`${PILL} border border-line bg-surface text-ink hover:bg-sunken`}>{r.editInputsButton}</button>
        <button type="button" onClick={onExportPdf} className={`${PILL} border border-line bg-surface text-ink hover:bg-sunken`}>{r.exportPdfButton}</button>
      </div>
    </section>
  );
};
