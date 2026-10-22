import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { RangeSlider } from '@/components/primitives/RangeSlider';
import { INSEAM_LIMITS, validateInseam } from '@/lib/engines/baikfit/coordinates';
import { cx } from '@/lib/classNames';
import { RIDER_PAIN_TYPES, RIDING_DISCIPLINES, type RiderPainType, type RidingDiscipline, type RidingStyle } from '@/types/baikfit';

export interface StudioInputState {
  inseamMm: number;
  acromionWidthMm: number;
  crankLengthMm: number;
  heightCm: number;
  discipline: RidingDiscipline;
  ridingStyle: RidingStyle;
  currentPains: RiderPainType[];
}

export interface StudioInputActions {
  setInseamMm: (val: number) => void;
  setAcromionWidthMm: (val: number) => void;
  setCrankLengthMm: (val: number) => void;
  setHeightCm: (val: number) => void;
  setDiscipline: (val: RidingDiscipline) => void;
  setRidingStyle: (val: RidingStyle) => void;
  togglePain: (pain: RiderPainType) => void;
}

const FIELD_LABEL = 'text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider block';
const PILL_SELECTED = 'border-cyan-400 bg-cyan-950/60 text-cyan-300';
const PILL_IDLE = 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700';

interface PillGroupProps<T extends string | number> {
  label: string;
  columns: 'grid-cols-5' | 'grid-cols-3' | 'grid-cols-2';
  compact?: boolean;
  options: Array<{ value: T; text: string }>;
  selected: T;
  onSelect: (value: T) => void;
}

/** Row of small selectable pills (crank length, discipline, riding style). */
function PillGroup<T extends string | number>({ label, columns, compact, options, selected, onSelect }: PillGroupProps<T>) {
  const size = compact
    ? 'py-1.5 px-1 rounded font-mono text-[11px] font-semibold border transition-all truncate text-center'
    : 'py-1.5 rounded font-mono text-xs font-bold border transition-all text-center';
  return (
    <div className={cx('space-y-1', compact && 'pt-2')}>
      <label className={FIELD_LABEL}>{label}</label>
      <div className={cx('grid gap-1.5', columns)}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            className={cx(size, selected === option.value ? PILL_SELECTED : PILL_IDLE)}
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
}

const CRANK_OPTIONS = [150, 160, 165, 170, 172.5];
const STYLES: RidingStyle[] = ['endurance', 'balanced', 'race'];

const Sliders: React.FC<{ t: Translations; state: StudioInputState; actions: StudioInputActions }> = ({ t, state, actions }) => (
  <>
    <div>
      <RangeSlider id="inseam-slider" label={t.studio.inseamLabel} value={state.inseamMm} min={INSEAM_LIMITS.MIN_MM} max={INSEAM_LIMITS.MAX_MM} step={5} unit="mm" onChange={actions.setInseamMm} />
      {!validateInseam(state.inseamMm).isValid && (
        <p className="text-xs text-rose-400 mt-1 font-mono">{t.studio.outOfRangeError}</p>
      )}
    </div>
    <div>
      <RangeSlider id="acromion-slider" label={t.studio.acromionLabel} value={state.acromionWidthMm} min={340} max={500} step={5} unit="mm" onChange={actions.setAcromionWidthMm} />
    </div>
    <div>
      <RangeSlider id="height-slider" label={t.studio.heightLabel} value={state.heightCm} min={140} max={215} step={1} unit="cm" onChange={actions.setHeightCm} />
    </div>
  </>
);

const PainList: React.FC<{ t: Translations; selected: RiderPainType[]; onToggle: (pain: RiderPainType) => void }> = ({ t, selected, onToggle }) => (
  <div className="space-y-1.5 pt-2">
    <label className={FIELD_LABEL}>{t.studio.currentPainsLabel}</label>
    <div className="space-y-1">
      {RIDER_PAIN_TYPES.map((pain) => (
        <button
          key={pain}
          type="button"
          onClick={() => onToggle(pain)}
          className={cx(
            'w-full text-left px-2.5 py-1.5 rounded border text-xs transition-colors flex items-center justify-between',
            selected.includes(pain)
              ? 'border-amber-500/60 bg-amber-950/30 text-amber-200'
              : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700'
          )}
        >
          <span className="truncate">{t.studio.pains[pain].split('/')[0]}</span>
          <span className="font-mono text-[10px]">{selected.includes(pain) ? t.studio.painActive : t.studio.painNone}</span>
        </button>
      ))}
    </div>
  </div>
);

/** Precision input column of the studio: sliders, crank, discipline, riding style and symptoms. */
export const StudioInputs: React.FC<{ t: Translations; state: StudioInputState; actions: StudioInputActions }> = ({ t, state, actions }) => (
  <div className="space-y-4">
    <Sliders t={t} state={state} actions={actions} />
    <PillGroup label={t.studio.crankLabel} columns="grid-cols-5" options={CRANK_OPTIONS.map((value) => ({ value, text: String(value) }))} selected={state.crankLengthMm} onSelect={actions.setCrankLengthMm} />
    <PillGroup label={t.studio.disciplineLabel} columns="grid-cols-2" compact options={RIDING_DISCIPLINES.map((value) => ({ value, text: t.studio.disciplines[value].split(' ')[0] }))} selected={state.discipline} onSelect={actions.setDiscipline} />
    <PillGroup label={t.studio.ridingStyleLabel} columns="grid-cols-3" compact options={STYLES.map((value) => ({ value, text: t.studio.ridingStyles[value].split(' ')[0] }))} selected={state.ridingStyle} onSelect={actions.setRidingStyle} />
    <PainList t={t} selected={state.currentPains} onToggle={actions.togglePain} />
  </div>
);
