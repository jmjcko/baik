import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { PageHeader } from '@/components/primitives/PageHeader';

interface ReportHeaderProps {
  t: Translations;
  /** Whether the reasons section exists (a reported symptom is linked to a cause). */
  hasReasons: boolean;
  /** Scrolls to a section of the report by its element id. */
  onJump: (id: string) => void;
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

/** Friendly page header: title, one-sentence summary and the links to the sections (the buttons and the numbers are in the summary beside the report). */
export const ReportHeader: React.FC<ReportHeaderProps> = ({ t, hasReasons, onJump }) => {
  const r = t.diagnosticReport;
  return (
    <PageHeader eyebrow={r.auditBadge} title={r.title} subtitle={r.subtitle}>
      <JumpNav t={t} showReasons={hasReasons} onJump={onJump} />
    </PageHeader>
  );
};
