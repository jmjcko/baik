import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import type { ActionStep } from './buildActionPlan';
import type { ReportSummary } from './buildSummary';

interface ReportPrintSheetProps {
  t: Translations;
  summary: ReportSummary;
  steps: ActionStep[];
  /** Date printed in the header (YYYY-MM-DD); empty until the export was started. */
  printedOn: string | null;
}

type SheetTexts = Translations['diagnosticReport']['summary'];

const Measures: React.FC<{ rows: ReportSummary['measures'] }> = ({ rows }) => (
  <dl className="print-measures">
    {rows.map((row) => (
      <div key={row.label}>
        <dt>{row.label}</dt>
        <dd>{row.value}</dd>
      </div>
    ))}
  </dl>
);

const SetupTable: React.FC<{ s: SheetTexts; rows: ReportSummary['setup'] }> = ({ s, rows }) => (
  <table className="print-table">
    <thead>
      <tr>
        <th>{s.colSetting}</th>
        <th>{s.colNow}</th>
        <th>{s.colTarget}</th>
        <th>{s.colChange}</th>
      </tr>
    </thead>
    <tbody>
      {rows.map((row) => (
        <tr key={row.key} data-estimate={row.estimate || undefined}>
          <td>{row.label}</td>
          <td>{row.now}</td>
          <td className="print-target">{row.target}</td>
          <td>{row.change}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const Plan: React.FC<{ steps: ActionStep[] }> = ({ steps }) => (
  <ol className="print-plan">
    {steps.map((step) => (
      <li key={step.id}>
        <strong>{step.title}.</strong> {step.body}
      </li>
    ))}
  </ol>
);

/**
 * One-page summary for the PDF export: the rider's measurements and the bike setup now against the target.
 * It exists in the page but is visible only when printing (the paper is always light: see `.print-sheet` in globals.css).
 */
export const ReportPrintSheet: React.FC<ReportPrintSheetProps> = ({ t, summary, steps, printedOn }) => {
  const s = t.diagnosticReport.summary;
  return (
    <section data-testid="print-sheet" aria-hidden="true" className="print-sheet">
      <header className="print-head">
        <h1>{s.docTitle}</h1>
        {printedOn && <p>{fill(s.preparedOn, { date: printedOn })}</p>}
      </header>
      <h2>{s.measuresTitle}</h2>
      <Measures rows={summary.measures} />
      <h2>{s.setupTitle}</h2>
      <SetupTable s={s} rows={summary.setup} />
      <p className="print-note">{t.studio.estimateNote}</p>
      <h2>{s.planTitle}</h2>
      <Plan steps={steps} />
    </section>
  );
};
