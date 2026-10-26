import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { KB_RULES } from '@/lib/engines/baikfit/kbRules';
import { cx } from '@/lib/classNames';
import { fill } from '@/lib/i18n/format';
import { GuideTrigger } from '@/components/baikfit/fields/GuideTrigger';
import { SliderField } from '@/components/baikfit/fields/SliderField';
import type { GuideType } from '@/components/baikfit/guides';

const CRANK_PRESETS = [150, 160, 165, 170, 172.5, 175];
const SADDLE_RANGE = { min: 600, max: 900 };
const BAR_RANGE = { min: 340, max: 460 };
const DEFAULT_BAR_MM = 420;
/** Flat bars of a mountain bike are far wider than drop bars. */
const FLAT_BAR_RANGE = { min: 680, max: 840 };
const DEFAULT_FLAT_BAR_MM = 760;

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
  /** The factory setup of the bike gives these values: they are shown but cannot be changed. */
  lockedBar?: boolean;
  lockedCrank?: boolean;
  /** A mountain bike: the bar is a flat bar (its own range, and the drop bar guide does not apply). */
  flatBar?: boolean;
}

const clamp = (value: number, { min, max }: { min: number; max: number }) => Math.min(max, Math.max(min, value));

const ClearButton: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <button type="button" onClick={onClick} className="text-[11px] font-mono text-ink-3 hover:text-ink underline">
    {label}
  </button>
);

const CrankPresets: React.FC<Pick<CurrentSetupProps, 't' | 'crankLengthMm' | 'setCrankLengthMm' | 'onOpenGuide' | 'lockedCrank'>> = (props) => (
  <div className="space-y-3">
    <label className="text-xs font-semibold text-ink-2 block">{props.t.wizard.currentCrankLabel}</label>
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
      {CRANK_PRESETS.map((length) => (
        <button
          key={length}
          type="button"
          disabled={props.lockedCrank}
          onClick={() => props.setCrankLengthMm(length)}
          className={cx(
            'py-2 px-1 rounded-full text-xs font-semibold border transition-all text-center disabled:cursor-not-allowed disabled:opacity-60',
            props.crankLengthMm === length
              ? 'bg-blue-600 text-slate-50 border-blue-600 shadow-sm'
              : 'bg-sunken text-ink-2 hover:bg-sunken border-line'
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
  const range = props.flatBar ? FLAT_BAR_RANGE : BAR_RANGE;
  return (
    <SliderField
      id="wizard-bar-slider"
      label={t.wizard.currentBarLabel}
      valueText={entered === null ? t.wizard.notSetChip : `${entered} mm`}
      value={entered ?? (props.flatBar ? DEFAULT_FLAT_BAR_MM : DEFAULT_BAR_MM)}
      min={range.min}
      max={range.max}
      step={5}
      onChange={props.setCurrentBarWidthMm}
      disabled={props.lockedBar}
    >
      {entered !== null && !props.lockedBar && <ClearButton label={t.wizard.clearValue} onClick={() => props.setCurrentBarWidthMm(null)} />}
      {entered === null && props.flatBar && <ClearButton label={fill(t.wizard.mtb.useValue, { value: `${DEFAULT_FLAT_BAR_MM} mm` })} onClick={() => props.setCurrentBarWidthMm(DEFAULT_FLAT_BAR_MM)} />}
      {!props.flatBar && <GuideTrigger testId="bar-guide-trigger" label={t.wizard.currentBarLink} onClick={() => props.onOpenGuide('barWidth')} />}
    </SliderField>
  );
};

/** Step 2 section: the rider's current crank length, saddle height and handlebar width with help guides. */
export const CurrentSetupFields: React.FC<CurrentSetupProps> = (props) => (
  <div className="p-5 rounded-xl border border-line bg-sunken space-y-5">
    <div>
      <h3 className="text-sm font-bold text-ink">{props.t.wizard.currentSetupTitle}</h3>
      <p className="text-xs text-ink-3 leading-relaxed">{props.t.wizard.currentSetupSubtitle}</p>
    </div>
    {(props.lockedBar || props.lockedCrank) && <p role="note" className="text-xs text-tone-warning-ink bg-tone-warning-bg border border-tone-warning-line rounded-xl px-3 py-2 leading-relaxed">{props.t.stockBike.picker.locked}</p>}
    <CrankPresets {...props} />
    <SaddleHeightField {...props} />
    <BarWidthField {...props} />
  </div>
);
