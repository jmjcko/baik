import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { INSEAM_LIMITS, validateInseam } from '@/lib/engines/baikfit/coordinates';
import type { GuideType } from './guides';
import { GuideTrigger } from './fields/GuideTrigger';
import { SliderField } from './fields/SliderField';

interface FieldProps {
  t: Translations;
  value: number;
  onChange: (value: number) => void;
  onOpenGuide: (guide: GuideType) => void;
}

const HINT_CLASS = 'text-[11px] text-slate-500';

export const InseamField: React.FC<FieldProps> = ({ t, value, onChange, onOpenGuide }) => (
  <SliderField
    id="wizard-inseam-slider"
    label={t.studio.inseamLabel}
    valueText={`${value} mm`}
    value={value}
    min={INSEAM_LIMITS.MIN_MM}
    max={INSEAM_LIMITS.MAX_MM}
    step="5"
    onChange={onChange}
  >
    {!validateInseam(value).isValid && (
      <p className="text-xs text-rose-600 font-mono font-semibold mt-1">{t.studio.outOfRangeError}</p>
    )}
    <GuideTrigger testId="inseam-guide-trigger" label={t.wizard.inseamAccordionTitle} onClick={() => onOpenGuide('inseam')} />
  </SliderField>
);

export const HeightField: React.FC<Omit<FieldProps, 'onOpenGuide'>> = ({ t, value, onChange }) => (
  <SliderField
    id="wizard-height-slider"
    label={t.studio.heightLabel}
    valueText={`${value} cm`}
    value={value}
    min="140"
    max="215"
    step="1"
    onChange={onChange}
  >
    <p className={HINT_CLASS}>
      {t.wizard.heightGuideTitle} &mdash; {t.wizard.heightAutoCalibrateHint}
    </p>
  </SliderField>
);

export const TorsoField: React.FC<FieldProps> = ({ t, value, onChange, onOpenGuide }) => (
  <SliderField
    id="wizard-torso-slider"
    label={t.prePurchaseAudit.torsoLabel}
    valueText={`${value} mm`}
    value={value}
    min="450"
    max="850"
    step="5"
    onChange={onChange}
  >
    <GuideTrigger testId="torso-guide-trigger" label={t.wizard.torsoAccordionTitle} onClick={() => onOpenGuide('torso')} />
  </SliderField>
);

export const ArmField: React.FC<FieldProps> = ({ t, value, onChange, onOpenGuide }) => (
  <SliderField
    id="wizard-arm-slider"
    label={t.prePurchaseAudit.armLabel}
    valueText={`${value} mm`}
    value={value}
    min="500"
    max="850"
    step="5"
    onChange={onChange}
  >
    <p className={HINT_CLASS}>{t.wizard.armGuideText}</p>
    <GuideTrigger testId="arm-guide-trigger" label={t.wizard.armGuideTitle} onClick={() => onOpenGuide('arm')} />
  </SliderField>
);

export const AcromionField: React.FC<FieldProps> = ({ t, value, onChange, onOpenGuide }) => (
  <SliderField
    id="wizard-acromion-slider"
    label={t.studio.acromionLabel}
    valueText={`${value} mm`}
    value={value}
    min="340"
    max="500"
    step="5"
    accent="teal"
    className="md:col-span-2"
    onChange={onChange}
  >
    <p className={HINT_CLASS}>
      {t.prePurchaseAudit.acromionLabel} &mdash; {t.wizard.acromionHandlebarHint}
    </p>
    <GuideTrigger
      testId="acromion-guide-trigger"
      label={t.wizard.acromionAccordionTitle}
      accent="teal"
      onClick={() => onOpenGuide('acromion')}
    />
  </SliderField>
);
