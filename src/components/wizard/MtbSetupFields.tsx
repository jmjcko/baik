import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { cx } from '@/lib/classNames';
import { fill } from '@/lib/i18n/format';
import { SliderField } from '@/components/baikfit/fields/SliderField';
import { MTB_LIMITS, MTB_STYLES, sagOf, type MtbSetup } from '@/lib/engines/baikfit/mtb';

interface MtbSetupFieldsProps {
  t: Translations;
  mtb: MtbSetup;
  setMtb: (patch: Partial<MtbSetup>) => void;
}

const DEFAULT_TRAVEL_MM = 120;
const DEFAULT_DROPPER_MM = 150;

const Choice: React.FC<{ label: string; selected: boolean; onClick: () => void }> = ({ label, selected, onClick }) => (
  <button
    type="button"
    aria-pressed={selected}
    onClick={onClick}
    className={cx(
      'py-2 px-4 rounded-full text-xs font-semibold border transition-all',
      selected ? 'bg-blue-600 text-slate-50 border-blue-600 shadow-sm' : 'bg-sunken text-ink-2 hover:bg-sunken border-line'
    )}
  >
    {label}
  </button>
);

const ClearButton: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <button type="button" onClick={onClick} className="text-[11px] font-mono text-ink-3 hover:text-ink underline">
    {label}
  </button>
);

/** A slider for an optional number: "not set" until the rider moves it, and a way back to "not set". */
const OptionalSlider: React.FC<{ id: string; label: string; notSet: string; clear: string; useValue: string; unit: string; value: number | null; fallback: number; limits: readonly [number, number]; step: number; onChange: (value: number | null) => void }> = (p) => (
  <SliderField
    id={p.id}
    label={p.label}
    valueText={p.value === null ? p.notSet : `${p.value} ${p.unit}`}
    value={p.value ?? p.fallback}
    min={p.limits[0]}
    max={p.limits[1]}
    step={p.step}
    onChange={p.onChange}
  >
    {p.value !== null ? <ClearButton label={p.clear} onClick={() => p.onChange(null)} /> : <ClearButton label={fill(p.useValue, { value: `${p.fallback} ${p.unit}` })} onClick={() => p.onChange(p.fallback)} />}
  </SliderField>
);

/** Wizard step 4 for the MTB discipline: XC or Trail, hardtail or full suspension, fork travel, sag target and dropper post travel (KB 11). */
export const MtbSetupFields: React.FC<MtbSetupFieldsProps> = ({ t, mtb, setMtb }) => {
  const m = t.wizard.mtb;
  const shared = { notSet: t.wizard.notSetChip, clear: t.wizard.clearValue, useValue: m.useValue };
  return (
    <div className="p-5 rounded-xl border border-line bg-sunken space-y-5" data-testid="mtb-setup">
      <div>
        <h3 className="text-sm font-bold text-ink">{m.title}</h3>
        <p className="text-xs text-ink-3 leading-relaxed">{m.subtitle}</p>
      </div>
      <div className="space-y-2">
        <span className="text-xs font-semibold text-ink-2 block">{m.styleLabel}</span>
        <div className="flex flex-wrap gap-2">
          {MTB_STYLES.map((style) => <Choice key={style} label={m.styles[style]} selected={mtb.style === style} onClick={() => setMtb({ style })} />)}
        </div>
      </div>
      <div className="space-y-2">
        <span className="text-xs font-semibold text-ink-2 block">{m.suspensionLabel}</span>
        <div className="flex flex-wrap gap-2">
          <Choice label={m.hardtail} selected={!mtb.fullSuspension} onClick={() => setMtb({ fullSuspension: false })} />
          <Choice label={m.full} selected={mtb.fullSuspension} onClick={() => setMtb({ fullSuspension: true })} />
        </div>
      </div>
      <OptionalSlider id="mtb-travel-slider" label={m.travelLabel} unit="mm" value={mtb.travelMm} fallback={DEFAULT_TRAVEL_MM} limits={MTB_LIMITS.travelMm} step={5} onChange={(travelMm) => setMtb({ travelMm })} {...shared} />
      <OptionalSlider id="mtb-sag-slider" label={m.sagLabel} unit="%" value={mtb.sagPercent} fallback={sagOf(mtb)} limits={MTB_LIMITS.sagPercent} step={1} onChange={(sagPercent) => setMtb({ sagPercent })} {...shared} />
      <p className="text-[11px] text-ink-3 -mt-3">{m.sagHint}</p>
      <OptionalSlider id="mtb-dropper-slider" label={m.dropperLabel} unit="mm" value={mtb.dropperTravelMm} fallback={DEFAULT_DROPPER_MM} limits={MTB_LIMITS.dropperTravelMm} step={5} onChange={(dropperTravelMm) => setMtb({ dropperTravelMm })} {...shared} />
      <p className="text-xs text-ink-3 leading-relaxed">{m.barNote}</p>
    </div>
  );
};
