import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { TargetNumbers } from '@/components/report/TargetNumbers';
import { Case, SectionFrame } from '../ShowcaseCase';
import { RIDERS } from '../fixtures';

/** Target number cards (saddle height, handlebar width, crank length, setback and pitch) and the estimates strip for several riders. */
export const TargetsSection: React.FC<{ t: Translations }> = ({ t }) => (
  <SectionFrame id="targets" title="Target number cards" hint="TargetNumbers with its explanation panel and the cockpit estimates strip, for three riders.">
    <div className="space-y-10">
      {RIDERS.map((rider) => (
        <Case key={rider.id} label={rider.name}>
          <TargetNumbers t={t} coordinates={rider.coordinates} input={rider.input} discipline={rider.discipline} />
        </Case>
      ))}
    </div>
  </SectionFrame>
);
