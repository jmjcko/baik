import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { KB_RULES } from '@/lib/engines/baikfit/kbRules';
import { cx } from '@/lib/classNames';
import { GuideTrigger } from '@/components/baikfit/fields/GuideTrigger';
import { SliderField } from '@/components/baikfit/fields/SliderField';
import type { GuideType } from '@/components/baikfit/guides';

const CRANK_PRESETS = [150, 160, 165, 170, 172.5, 175];
const SADDLE_RANGE = { min: 600, max: 900 };
const BAR_RANGE = { min: 340, max: 460 };
const DEFAULT_BAR_MM = 420;

export interface CurrentSetupProps {
  t: Translations;
  inseamMm: number;
  crankLengthMm: number;
  currentSaddleHeightMm: number | null;
  currentBarWidthMm: number | null;
  setCrankLengthMm: (value: number) => void;
  setCurrentSaddleHeightMm: (value: number | null) => void;
  setCurrentBarWidthMm: (value: number | null) => void;
  onOpenGuide: (guide: GuideType) => void;
}

const clamp = (value: number, { min, max }: { min: number; max: number }) => Math.min(max, Math.max(min, value));

const ClearButton: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <button type="button" onClick={onClick} className="text-[11px] font-mono text-slate-500 hover:text-slate-800 underline">
    {label}
  </button>
);

const CrankPresets: React.FC<Pick<CurrentSetupProps, 't' | 'crankLengthMm' | 'setCrankLengthMm' | 'onOpenGuide'>> = (props) => (
  <div className="space-y-3">
    <label className="text-xs font-semibold text-slate-700 block">{props.t.wizard.currentCrankLabel}</label>
    <div className="grid grid-cols-6 gap-2">
      {CRANK_PRESETS.map((length) => (
        <button
          key={length}
          type="button"
          onClick={() => props.setCrankLengthMm(length)}
          className={cx(
            'py-2 px-1 rounded-full text-xs font-semibold border transition-all text-center',
            props.crankLengthMm === length
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
          )}
        >
          {length}mm
        </button>
      ))}
    </div>
    <GuideTrigger testId="crank-guide-trigger" label={props.t.wizard.currentCrankLink} onClick={() => props.onOpenGuide('crank')} />
  </div>
);

const SaddleHeightField: React.FC<CurrentSetupProps> = (props) => {
  const { t, currentSaddleHeightMm: entered } = props;
  const target = clamp(Math.round(props.inseamMm * KB_RULES.lemondCoefficient), SADDLE_RANGE);
  return (
    <SliderField
      id="wizard-saddle-slider"
      label={t.wizard.currentSaddleLabel}
      valueText={entered === null ? t.wizard.notSetChip : `${entered} mm`}
      value={entered ?? target}
      min={SADDLE_RANGE.min}
      max={SADDLE_RANGE.max}
      step={1}
      onChange={props.setCurrentSaddleHeightMm}
    >
      {entered !== null && <ClearButton label={t.wizard.clearValue} onClick={() => props.setCurrentSaddleHeightMm(null)} />}
      <GuideTrigger testId="saddle-guide-trigger" label={t.wizard.currentSaddleLink} onClick={() => props.onOpenGuide('saddleHeight')} />
    </SliderField>
  );
};

const BarWidthField: React.FC<CurrentSetupProps> = (props) => {
  const { t, currentBarWidthMm: entered } = props;
  return (
    <SliderField
      id="wizard-bar-slider"
      label={t.wizard.currentBarLabel}
      valueText={entered === null ? t.wizard.notSetChip : `${entered} mm`}
      value={entered ?? DEFAULT_BAR_MM}
      min={BAR_RANGE.min}
      max={BAR_RANGE.max}
      step={5}
      onChange={props.setCurrentBarWidthMm}
    >
      {entered !== null && <ClearButton label={t.wizard.clearValue} onClick={() => props.setCurrentBarWidthMm(null)} />}
      <GuideTrigger testId="bar-guide-trigger" label={t.wizard.currentBarLink} onClick={() => props.onOpenGuide('barWidth')} />
    </SliderField>
  );
};

/** Step 2 section: the rider's current crank length, saddle height and handlebar width with help guides. */
export const CurrentSetupFields: React.FC<CurrentSetupProps> = (props) => (
  <div className="p-5 rounded-xl border border-slate-200/80 bg-slate-50/60 space-y-5">
    <div>
      <h3 className="text-sm font-bold text-slate-900">{props.t.wizard.currentSetupTitle}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{props.t.wizard.currentSetupSubtitle}</p>
    </div>
    <CrankPresets {...props} />
    <SaddleHeightField {...props} />
    <BarWidthField {...props} />
  </div>
);
