'use client';

import React, { useState } from 'react';
import { Translations } from '@/lib/i18n/translations';
import { MorphologyWizardStep } from '@/components/baikfit/MorphologyWizardStep';
import type { RidingDiscipline, RidingStyle, RiderPainType } from '@/types/baikfit';
import { PainStep } from './PainStep';
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
  onCompleteWizard: () => void;
  onCancel: () => void;
}

const DEFAULT_TORSO_MM = 620;

export const MeasurementWizard: React.FC<MeasurementWizardProps> = (props) => {
  const { t, onCompleteWizard, onCancel } = props;
  const [subStep, setSubStep] = useState<1 | 2>(1);
  const [internalTorso, setInternalTorso] = useState(props.torsoLengthMm ?? DEFAULT_TORSO_MM);

  const handleNext = () => (subStep === 1 ? setSubStep(2) : onCompleteWizard());
  const handleBack = () => (subStep === 2 ? setSubStep(1) : onCancel());

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <WizardProgress step={subStep} label={subStep === 1 ? t.wizard.step1Progress : t.wizard.step2Progress} />
      <div className="p-8 rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all">
        {subStep === 1 ? (
          <MorphologyWizardStep
            {...props}
            torsoLengthMm={props.torsoLengthMm ?? internalTorso}
            setTorsoLengthMm={props.setTorsoLengthMm ?? setInternalTorso}
          />
        ) : (
          <PainStep {...props} />
        )}
        <WizardActions
          backLabel={t.wizard.backButton}
          nextLabel={subStep === 1 ? t.wizard.toPainButton : t.wizard.toReportButton}
          onBack={handleBack}
          onNext={handleNext}
        />
      </div>
    </div>
  );
};
