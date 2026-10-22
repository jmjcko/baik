import React, { useState } from 'react';
import { MeasurementGuideModal } from '@/components/baikfit/MeasurementGuideModal';
import type { GuideType } from '@/components/baikfit/guides';
import { CurrentSetupFields, type CurrentSetupProps } from './CurrentSetupFields';
import { StepHeading } from './WizardChrome';

/** Wizard step 4: the rider's current crank length, saddle height and handlebar width with their guides. */
export const CurrentBikeStep: React.FC<Omit<CurrentSetupProps, 'onOpenGuide'>> = (props) => {
  const [activeGuide, setActiveGuide] = useState<GuideType | null>(null);
  return (
    <div className="space-y-6" data-testid="current-bike-step">
      <StepHeading title={props.t.wizard.bikeTitle} subtitle={props.t.wizard.bikeSubtitle} />
      <CurrentSetupFields {...props} onOpenGuide={setActiveGuide} />
      <MeasurementGuideModal isOpen={activeGuide !== null} onClose={() => setActiveGuide(null)} guideType={activeGuide} t={props.t} />
    </div>
  );
};
