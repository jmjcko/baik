import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { RangeSlider } from '@/components/primitives/RangeSlider';
import { INSEAM_LIMITS, validateInseam } from '@/lib/engines/baikfit/coordinates';
import { cx } from '@/lib/classNames';
import { RIDER_PAIN_TYPES, RIDING_DISCIPLINES, type RiderPainType, type RidingDiscipline } from '@/types/baikfit';

export interface StudioInputState {
  inseamMm: number;
  acromionWidthMm: number;
  crankLengthMm: number;
  discipline: RidingDiscipline;
  currentPains: RiderPainType[];
}

export interface StudioInputActions {
  setInseamMm: (val: number) => void;
  setAcromionWidthMm: (val: number) => void;
  setCrankLengthMm: (val: number) => void;
  setDiscipline: (val: RidingDiscipline) => void;
  togglePain: (pain: RiderPainType) => void;
}

const FIELD_LABEL = 'text-sm font-mono font-semibold text-ink-2 uppercase tracking-wider block';
const PILL_SELECTED = 'border-tone-info-line bg-tone-info-badge text-accent-ink';
const PILL_IDLE = 'border-line bg-surface text-ink-3 hover:border-ink-3';

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
    ? 'py-1.5 px-1 rounded font-mono text-sm font-semibold border transition-all truncate text-center'
    : 'py-1.5 rounded font-mono text-sm font-bold border transition-all text-center';
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

const Sliders: React.FC<{ t: Translations; state: StudioInputState; actions: StudioInputActions }> = ({ t, state, actions }) => (
  <>
    <div>
      <RangeSlider id="inseam-slider" label={t.studio.inseamLabel} value={state.inseamMm} min={INSEAM_LIMITS.MIN_MM} max={INSEAM_LIMITS.MAX_MM} step={5} unit="mm" onChange={actions.setInseamMm} />
      {!validateInseam(state.inseamMm).isValid && (
        <p className="text-sm text-tone-danger-ink mt-1 font-mono">{t.studio.outOfRangeError}</p>
      )}
    </div>
    <div>
      <RangeSlider id="acromion-slider" label={t.studio.acromionLabel} value={state.acromionWidthMm} min={340} max={500} step={5} unit="mm" onChange={actions.setAcromionWidthMm} />
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
            'w-full text-left px-2.5 py-1.5 rounded border text-sm transition-colors flex items-center justify-between',
            selected.includes(pain)
              ? 'border-tone-warning-line bg-tone-warning-badge text-tone-warning-ink'
              : 'border-line bg-surface text-ink-3 hover:border-ink-3'
          )}
        >
          <span className="truncate">{t.studio.pains[pain].split('/')[0]}</span>
          <span className="font-mono text-sm">{selected.includes(pain) ? t.studio.painActive : t.studio.painNone}</span>
        </button>
      ))}
    </div>
  </div>
);

/** Precision input column of the studio: only the values that change the numbers: inseam, shoulders, crank, discipline and symptoms. */
export const StudioInputs: React.FC<{ t: Translations; state: StudioInputState; actions: StudioInputActions }> = ({ t, state, actions }) => (
  <div className="space-y-4">
    <Sliders t={t} state={state} actions={actions} />
    <PillGroup label={t.studio.crankLabel} columns="grid-cols-5" options={CRANK_OPTIONS.map((value) => ({ value, text: String(value) }))} selected={state.crankLengthMm} onSelect={actions.setCrankLengthMm} />
    <PillGroup label={t.studio.disciplineLabel} columns="grid-cols-2" compact options={RIDING_DISCIPLINES.map((value) => ({ value, text: t.studio.disciplines[value].split(' ')[0] }))} selected={state.discipline} onSelect={actions.setDiscipline} />
    <PainList t={t} selected={state.currentPains} onToggle={actions.togglePain} />
  </div>
);
