'use client';

import React, { useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import type { BikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import type { RidingDiscipline } from '@/types/baikfit';
import { cx } from '@/lib/classNames';
import { buildTargets, type Target, type TargetKey } from './buildTargets';
import type { FindingInput } from './reportFindings';

const EstimateChip: React.FC<{ text: string; title: string }> = ({ text, title }) => (
  <span title={title} className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-line bg-sunken text-ink-3">
    {text}
  </span>
);

interface TargetCardProps {
  target: Target;
  selected: boolean;
  chip: { text: string; title: string };
  explainLabel: string;
  onToggle: () => void;
}

const TargetCard: React.FC<TargetCardProps> = ({ target, selected, chip, explainLabel, onToggle }) => (
  <div data-testid={`target-${target.key}`} className={cx('p-4 rounded-2xl border flex flex-col', selected ? 'border-tone-info-line bg-tone-info-bg' : 'border-line bg-surface')}>
    <div className="flex items-start justify-between gap-2 mb-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-3">{target.label}</span>
      {target.estimate && <EstimateChip {...chip} />}
    </div>
    <span className="text-3xl font-bold font-mono text-ink">{target.value}</span>
    <span className="text-xs text-ink-3 mt-1 flex-1">{target.note}</span>
    <button
      type="button"
      aria-expanded={selected}
      aria-controls={`explain-${target.key}`}
      onClick={onToggle}
      className="mt-3 self-start text-sm font-semibold text-accent-ink hover:underline"
    >
      {explainLabel}
    </button>
  </div>
);

const Block: React.FC<{ label: string; text: string }> = ({ label, text }) => (
  <div>
    <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-3 mb-1.5">{label}</h4>
    <p className="text-sm text-ink-2 leading-relaxed">{text}</p>
  </div>
);

/** Full-width panel under the cards: what the number means, how it was calculated, why it matters. */
const ExplainPanel: React.FC<{ target: Target; labels: Translations['diagnosticReport']['targets'] }> = ({ target, labels }) => (
  <div id={`explain-${target.key}`} role="region" aria-label={target.label} className="p-6 rounded-2xl border border-tone-info-line bg-surface grid gap-6 md:grid-cols-3">
    <Block label={labels.whatLabel} text={target.meaning} />
    <Block label={labels.originLabel} text={target.origin} />
    <Block label={labels.impactLabel} text={target.impact} />
  </div>
);

const CockpitStrip: React.FC<{ t: Translations; coordinates: BikeFitCoordinates; chip: { text: string; title: string } }> = ({ t, coordinates, chip }) => (
  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-2">
    <span className="text-xs font-semibold uppercase tracking-wide text-ink-3">{t.diagnosticReport.targets.cockpitTitle}</span>
    <span>
      {t.studio.stack}: <span className="font-mono font-bold text-ink">{coordinates.cockpit.stackYMm} mm</span>
    </span>
    <span>
      {t.studio.reach}: <span className="font-mono font-bold text-ink">{coordinates.cockpit.reachXMm} mm</span>
    </span>
    <EstimateChip {...chip} />
  </div>
);

interface TargetNumbersProps {
  t: Translations;
  coordinates: BikeFitCoordinates;
  input: FindingInput;
  discipline: RidingDiscipline;
}

/** "Your target numbers": four cards, one explanation panel (saddle height open by default) and the cockpit estimates. */
export const TargetNumbers: React.FC<TargetNumbersProps> = ({ t, coordinates, input, discipline }) => {
  const [open, setOpen] = useState<TargetKey | null>('saddle');
  const r = t.diagnosticReport;
  const targets = buildTargets(t, input, coordinates, discipline);
  const chip = { text: r.estimateChip, title: t.studio.estimateNote };
  const selected = targets.find((target) => target.key === open);
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold text-ink tracking-tight">{r.targetsTitle}</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {targets.map((target) => (
          <TargetCard
            key={target.key}
            target={target}
            selected={open === target.key}
            chip={chip}
            explainLabel={open === target.key ? r.targets.hideButton : r.targets.explainButton}
            onToggle={() => setOpen(open === target.key ? null : target.key)}
          />
        ))}
      </div>
      {selected && <ExplainPanel target={selected} labels={r.targets} />}
      <CockpitStrip t={t} coordinates={coordinates} chip={chip} />
    </section>
  );
};
