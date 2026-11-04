'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { cx } from '@/lib/classNames';
import { buildTargets, type Target, type TargetKey } from './buildTargets';
import { Block, CockpitStrip, EstimateChip, type TargetNumbersProps } from './TargetNumbers';

interface RowProps {
  target: Target;
  open: boolean;
  chip: { text: string; title: string };
  labels: Translations['diagnosticReport']['targets'];
  onToggle: () => void;
}

/** One target number: the value always in view, its explanation (what it means, where it comes from, why it matters) opens under it. */
const Row: React.FC<RowProps> = ({ target, open, chip, labels, onToggle }) => (
  <li data-testid={`target-${target.key}`}>
    <button type="button" aria-expanded={open} aria-controls={`explain-${target.key}`} onClick={onToggle} className="w-full flex items-center justify-between gap-3 py-3 text-left">
      <span>
        <span className="block text-xs font-semibold uppercase tracking-wide text-ink-3">{target.label}</span>
        <span className="block text-2xl font-bold font-mono text-ink">{target.value}</span>
      </span>
      <span className="flex items-center gap-2 shrink-0">
        {target.estimate && <EstimateChip {...chip} />}
        <ChevronDown aria-hidden="true" className={cx('w-4 h-4 text-ink-3 transition-transform', open && 'rotate-180')} />
      </span>
    </button>
    {open && (
      <div id={`explain-${target.key}`} role="region" aria-label={target.label} className="pb-4 space-y-3">
        <p className="text-xs text-ink-3">{target.note}</p>
        <Block label={labels.whatLabel} text={target.meaning} />
        <Block label={labels.originLabel} text={target.origin} />
        <Block label={labels.impactLabel} text={target.impact} />
      </div>
    )}
  </li>
);

/** "Your target numbers" beside the report: the four numbers and the cockpit estimates always in view, the explanation of the number that is pressed opens under it (the column stays short). */
export const TargetNumbersSide: React.FC<Omit<TargetNumbersProps, 'showTitle'>> = ({ t, coordinates, input, discipline }) => {
  const [open, setOpen] = useState<TargetKey | null>(null);
  const r = t.diagnosticReport;
  const chip = { text: r.estimateChip, title: t.studio.estimateNote };
  return (
    <section id="report-numbers" aria-labelledby="report-numbers-title" className="rounded-2xl border border-line bg-surface shadow-sm p-5 space-y-3">
      <h2 id="report-numbers-title" className="text-xs font-bold uppercase tracking-wider text-ink-3">{r.targetsTitle}</h2>
      <ul className="divide-y divide-line">
        {buildTargets(t, input, coordinates, discipline).map((target) => (
          <Row key={target.key} target={target} open={open === target.key} chip={chip} labels={r.targets} onToggle={() => setOpen(open === target.key ? null : target.key)} />
        ))}
      </ul>
      <CockpitStrip t={t} coordinates={coordinates} chip={chip} />
    </section>
  );
};
