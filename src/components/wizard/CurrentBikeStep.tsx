import React, { useState } from 'react';
import { MeasurementGuideModal } from '@/components/baikfit/MeasurementGuideModal';
import type { GuideType } from '@/components/baikfit/guides';
import { resolveStockBike } from '@/lib/bikes/resolve';
import type { StockSelection } from '@/lib/bikes/types';
import { CurrentSetupFields, type CurrentSetupProps } from './CurrentSetupFields';
import { StockBikePicker } from './stock/StockBikePicker';
import { StepHeading } from './WizardChrome';

type CurrentBikeStepProps = Omit<CurrentSetupProps, 'onOpenGuide'> & {
  stockBike: StockSelection | null;
  setStockBike: (selection: StockSelection | null) => void;
};

/** Wizard step 4: the factory setup of the bike (optional), the rider's current crank length, saddle height and handlebar width with their guides. */
export const CurrentBikeStep: React.FC<CurrentBikeStepProps> = (props) => {
  const [activeGuide, setActiveGuide] = useState<GuideType | null>(null);
  /* With the factory setup known, the handlebar and the cranks are the ones of the maker (when it publishes them), so the audit is unambiguous. */
  const factory = resolveStockBike(props.stockBike, 'road')?.spec;
  return (
    <div className="space-y-6" data-testid="current-bike-step">
      <StepHeading title={props.t.wizard.bikeTitle} subtitle={props.t.wizard.bikeSubtitle} />
      <StockBikePicker t={props.t} stockBike={props.stockBike} setStockBike={props.setStockBike} setCurrentBarWidthMm={props.setCurrentBarWidthMm} setCrankLengthMm={props.setCrankLengthMm} />
      <CurrentSetupFields {...props} lockedBar={factory?.stockHandlebarMm != null} lockedCrank={factory?.stockCrankMm != null} onOpenGuide={setActiveGuide} />
      <MeasurementGuideModal isOpen={activeGuide !== null} onClose={() => setActiveGuide(null)} guideType={activeGuide} t={props.t} />
    </div>
  );
};
