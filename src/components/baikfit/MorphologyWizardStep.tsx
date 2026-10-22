'use client';

import React, { useState } from 'react';
import { Translations } from '@/lib/i18n/translations';
import { MeasurementGuideModal } from '@/components/baikfit/MeasurementGuideModal';
import type { RidingStyle } from '@/types/baikfit';
import type { GuideType } from './guides';
import { AcromionField, ArmField, HeightField, InseamField, RidingStylePicker, TorsoField } from './MorphologyFields';

export interface MorphologyWizardStepProps {
  t: Translations;
  inseamMm: number;
  setInseamMm: (val: number) => void;
  torsoLengthMm: number;
  setTorsoLengthMm: (val: number) => void;
  acromionWidthMm: number;
  setAcromionWidthMm: (val: number) => void;
  heightCm: number;
  setHeightCm: (val: number) => void;
  armLengthMm: number;
  setArmLengthMm: (val: number) => void;
  ridingStyle: RidingStyle;
  setRidingStyle: (val: RidingStyle) => void;
}

const TORSO_PER_CM = 3.4;
const ARM_PER_CM = 3.8;

export const MorphologyWizardStep: React.FC<MorphologyWizardStepProps> = (props) => {
  const { t, setHeightCm, setTorsoLengthMm, setArmLengthMm } = props;
  const [activeGuide, setActiveGuide] = useState<GuideType | null>(null);

  const changeHeight = (heightCm: number) => {
    setHeightCm(heightCm);
    setTorsoLengthMm(Math.round(heightCm * TORSO_PER_CM));
    setArmLengthMm(Math.round(heightCm * ARM_PER_CM));
  };

  return (
    <div className="space-y-6" data-testid="morphology-wizard-step">
      <div className="p-6 rounded-2xl border border-slate-200/80 bg-white shadow-sm space-y-6">
        <div className="border-b border-slate-200/80 pb-4">
          <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-blue-600">{t.wizard.step1Title}</h2>
          <p className="text-xs text-slate-500 mt-1">{t.wizard.step1Subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InseamField t={t} value={props.inseamMm} onChange={props.setInseamMm} onOpenGuide={setActiveGuide} />
          <HeightField t={t} value={props.heightCm} onChange={changeHeight} />
          <TorsoField t={t} value={props.torsoLengthMm} onChange={setTorsoLengthMm} onOpenGuide={setActiveGuide} />
          <ArmField t={t} value={props.armLengthMm} onChange={setArmLengthMm} onOpenGuide={setActiveGuide} />
          <AcromionField t={t} value={props.acromionWidthMm} onChange={props.setAcromionWidthMm} onOpenGuide={setActiveGuide} />
        </div>
        <RidingStylePicker t={t} value={props.ridingStyle} onChange={props.setRidingStyle} />
      </div>
      <MeasurementGuideModal isOpen={activeGuide !== null} onClose={() => setActiveGuide(null)} guideType={activeGuide} t={t} />
    </div>
  );
};
