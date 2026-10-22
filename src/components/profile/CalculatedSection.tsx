import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import type { BikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import { KB_VERSION } from '@/lib/engines/baikfit/kbRules';
import type { ProfileValues } from '@/lib/profile/values';
import { TargetNumbers } from '@/components/report/TargetNumbers';
import { Block } from './ProfileParts';

interface CalculatedSectionProps {
  t: Translations;
  values: ProfileValues;
  coordinates: BikeFitCoordinates;
}

/** The calculated targets: the same numbers and explanations as the report, with the version of the knowledge base behind them. */
export const CalculatedSection: React.FC<CalculatedSectionProps> = ({ t, values, coordinates }) => {
  const c = t.profile.calculated;
  const input = {
    inseamMm: values.inseamMm,
    acromionWidthMm: values.acromionWidthMm,
    crankLengthMm: values.crankLengthMm,
    saddleHeightMm: coordinates.saddle.heightAlongTubeMm,
    currentBarWidthMm: values.currentBarWidthMm,
    currentSaddleHeightMm: values.currentSaddleHeightMm,
  };
  return (
    <Block id="profile-calculated" title={c.title} intro={c.intro}>
      <TargetNumbers t={t} coordinates={coordinates} input={input} discipline={values.discipline} showTitle={false} />
      <p className="text-xs font-mono text-ink-3">
        {c.kbVersion}: <span data-testid="kb-version" className="font-bold text-ink">{KB_VERSION}</span> &middot; {c.locked}
      </p>
    </Block>
  );
};
