import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import type { BikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import { KB_VERSION } from '@/lib/engines/baikfit/kbRules';
import type { ProfileValues } from '@/lib/profile/values';
import { buildTargets, type Target } from '@/components/report/buildTargets';
import { Block, Card, PILL_SOLID } from './ProfileParts';

interface CalculatedSectionProps {
  t: Translations;
  values: ProfileValues;
  coordinates: BikeFitCoordinates;
  /** Opens the fit report, where every number is explained. */
  onOpenReport: () => void;
}

/** The four numbers as plain cards. */
const TargetTiles: React.FC<{ targets: Target[] }> = ({ targets }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {targets.map((target) => (
      <Card key={target.key} className="flex flex-col gap-1">
        <span data-testid={`target-${target.key}`} className="text-xs font-semibold uppercase tracking-wide text-ink-3">{target.label}</span>
        <span className="text-2xl font-bold font-mono text-ink">{target.value}</span>
        <span className="text-xs text-ink-3">{target.note}</span>
      </Card>
    ))}
  </div>
);

/** The calculated targets as four plain numbers and the cockpit estimates; the explanations stay in the report, so they are written once. */
export const CalculatedSection: React.FC<CalculatedSectionProps> = ({ t, values, coordinates, onOpenReport }) => {
  const c = t.profile.calculated;
  const input = { inseamMm: values.inseamMm, acromionWidthMm: values.acromionWidthMm, crankLengthMm: values.crankLengthMm, saddleHeightMm: coordinates.saddle.heightAlongTubeMm, currentBarWidthMm: values.currentBarWidthMm, currentSaddleHeightMm: values.currentSaddleHeightMm };
  return (
    <Block id="profile-calculated" title={c.title} intro={c.intro}>
      <TargetTiles targets={buildTargets(t, input, coordinates, values.discipline)} />
      <Card className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <span className="text-sm text-ink-2">{t.profile.numbers.stack}: <span className="font-mono font-bold text-ink">{coordinates.cockpit.stackYMm} mm</span></span>
        <span className="text-sm text-ink-2">{t.profile.numbers.reach}: <span className="font-mono font-bold text-ink">{coordinates.cockpit.reachXMm} mm</span></span>
        <span className="text-xs font-mono text-ink-3">{c.kbVersion}: <span data-testid="kb-version" className="font-bold text-ink">{KB_VERSION}</span> &middot; {c.locked}</span>
        <span className="flex-1" />
        <button type="button" onClick={onOpenReport} className={PILL_SOLID}>{t.profile.numbers.openReport}</button>
      </Card>
    </Block>
  );
};
