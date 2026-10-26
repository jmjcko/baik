'use client';

import React, { useState } from 'react';
import type { WizardStepNumber } from '@/lib/hooks/useJourney';
import { Translations } from '@/lib/i18n/translations';
import { MorphologyWizardStep } from '@/components/baikfit/MorphologyWizardStep';
import type { StockSelection } from '@/lib/bikes/types';
import type { HamstringLevel, ReleaseResult } from '@/lib/engines/baikfit/mobility';
import type { MtbSetup } from '@/lib/engines/baikfit/mtb';
import type { RidingDiscipline, RidingStyle, RiderPainType } from '@/types/baikfit';
import { SurfaceCard } from '@/components/primitives/SurfaceCard';
import { CurrentBikeStep } from './CurrentBikeStep';
import { DisciplineStep } from './DisciplineStep';
import { PostureStep } from './PostureStep';
import { WizardActions, WizardProgress } from './WizardChrome';

export type PainType = RiderPainType;

interface MeasurementWizardProps {
  t: Translations;
  inseamMm: number;
  setInseamMm: (val: number) => void;
  torsoLengthMm?: number;
  setTorsoLengthMm?: (val: number) => void;
  acromionWidthMm: number;
  setAcromionWidthMm: (val: number) => void;
  crankLengthMm: number;
  setCrankLengthMm: (val: number) => void;
  currentSaddleHeightMm: number | null;
  setCurrentSaddleHeightMm: (val: number | null) => void;
  currentBarWidthMm: number | null;
  setCurrentBarWidthMm: (val: number | null) => void;
  heightCm: number;
  setHeightCm: (val: number) => void;
  armLengthMm: number;
  setArmLengthMm: (val: number) => void;
  discipline: RidingDiscipline;
  setDiscipline: (val: RidingDiscipline) => void;
  ridingStyle: RidingStyle;
  setRidingStyle: (val: RidingStyle) => void;
  currentPains: PainType[];
  togglePain: (pain: PainType) => void;
  hamstringTest?: HamstringLevel | null;
  setHamstringTest?: (answer: HamstringLevel | null) => void;
  releaseTest?: ReleaseResult | null;
  setReleaseTest?: (answer: ReleaseResult | null) => void;
  /** The garage bike that the wizard fits (shown in step 1) and the way to switch or add one. */
  activeBikeName?: string | null;
  activeBikeId?: string;
  onManageBikes?: () => void;
  /** The mountain bike setup (Epic 29), shown in step 4 for the MTB discipline. */
  mtb?: MtbSetup;
  setMtb?: (patch: Partial<MtbSetup>) => void;
  stockBike: StockSelection | null;
  setStockBike: (selection: StockSelection | null) => void;
  /** Current wizard step; shared app state so the sidebar stepper and the buttons stay in sync. */
  step: WizardStepNumber;
  onStepChange: (step: WizardStepNumber) => void;
  onCompleteWizard: () => void;
  onCancel: () => void;
}

const DEFAULT_TORSO_MM = 620;
const LAST_STEP: WizardStepNumber = 4;

type StepProps = MeasurementWizardProps & { torsoLengthMm: number; setTorsoLengthMm: (val: number) => void };

const StepContent: React.FC<{ step: WizardStepNumber; props: StepProps }> = ({ step, props }) => {
  switch (step) {
    case 1:
      return <DisciplineStep {...props} />;
    case 2:
      return <MorphologyWizardStep {...props} />;
    case 3:
      return <PostureStep {...props} />;
    default:
      return <CurrentBikeStep {...props} />;
  }
};

export const MeasurementWizard: React.FC<MeasurementWizardProps> = (props) => {
  const { t, step, onStepChange, onCompleteWizard, onCancel } = props;
  const [internalTorso, setInternalTorso] = useState(props.torsoLengthMm ?? DEFAULT_TORSO_MM);
  const w = t.wizard;
  const progressLabels = [w.step1Progress, w.step2Progress, w.step3Progress, w.step4Progress];
  const nextLabels = [w.continueToBody, w.continueToPosture, w.continueToBike, w.toReportButton];

  const handleNext = () => (step === LAST_STEP ? onCompleteWizard() : onStepChange((step + 1) as WizardStepNumber));
  const handleBack = () => (step === 1 ? onCancel() : onStepChange((step - 1) as WizardStepNumber));

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <WizardProgress step={step} label={progressLabels[step - 1]} />
      <SurfaceCard padding="lg">
        <StepContent
          step={step}
          props={{ ...props, torsoLengthMm: props.torsoLengthMm ?? internalTorso, setTorsoLengthMm: props.setTorsoLengthMm ?? setInternalTorso }}
        />
        <WizardActions backLabel={w.backButton} nextLabel={nextLabels[step - 1]} onBack={handleBack} onNext={handleNext} />
      </SurfaceCard>
    </div>
  );
};
