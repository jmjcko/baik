import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { cx } from '@/lib/classNames';
import { PARAMS } from '@/types/gearTaxonomy';
import { GEAR_OPTIONS, type ChoiceParamId, type GearAnswer, type GearParamId } from '@/types/gearTypes';

interface FieldProps {
  t: Translations;
  id: GearParamId;
  answer: GearAnswer | undefined;
  onChange: (answer: GearAnswer | null) => void;
}

const INPUT = 'h-12 w-full rounded-xl border border-line bg-surface px-4 text-sm text-ink';

/** A question answered by pressing a card; pressing the chosen card again takes the answer back. */
const ChoiceField: React.FC<FieldProps> = ({ t, id, answer, onChange }) => (
  <div role="group" aria-label={t.gear.params[id].label} className="flex flex-wrap gap-2">
    {GEAR_OPTIONS[id as ChoiceParamId].map((option) => {
      const chosen = answer?.value === option;
      return (
        <button key={option} type="button" aria-pressed={chosen} onClick={() => onChange(chosen ? null : { value: option, fromGarage: false })} data-testid={`param-${id}-${option}`} className={cx('h-10 px-4 rounded-full text-xs font-semibold border transition-colors', chosen ? 'bg-blue-600 border-blue-600 text-slate-50' : 'border-line bg-surface text-ink-2 hover:bg-sunken')}>
          {(t.gear.options[id as ChoiceParamId] as Record<string, string>)[option]}
        </button>
      );
    })}
  </div>
);

/** A number or a short text; an empty field is no answer, and a number that cannot be read is not kept. */
const TypedField: React.FC<FieldProps> = ({ t, id, answer, onChange }) => {
  const param = PARAMS[id];
  const isNumber = param.kind === 'number';
  const change = (text: string) => {
    const value = isNumber ? Number(text.replace(',', '.')) : text;
    onChange(text.trim() === '' || (isNumber && !Number.isFinite(value)) ? null : { value, fromGarage: false });
  };
  return (
    <div className="flex items-center gap-2">
      <input type="text" inputMode={isNumber ? 'decimal' : 'text'} aria-label={t.gear.params[id].label} value={answer ? String(answer.value) : ''} onChange={(e) => change(e.target.value)} data-testid={`param-${id}`} className={INPUT} />
      {param.unit && <span className="text-xs font-mono text-ink-3 shrink-0">{param.unit}</span>}
    </div>
  );
};

/** One question of the survey: its label, why it matters, the field, and a note when the first value came from the garage. */
export const ParamField: React.FC<FieldProps> = (props) => {
  const { t, id, answer } = props;
  return (
    <div className="rounded-xl border border-line p-4 space-y-2" data-testid={`field-${id}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold text-ink">{t.gear.params[id].label}</p>
        {answer?.fromGarage && <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border border-tone-info-line bg-tone-info-bg text-tone-info-ink" data-testid={`garage-${id}`}>{t.gear.fromGarage}</span>}
      </div>
      <p className="text-xs text-ink-2">{t.gear.params[id].hint}</p>
      {PARAMS[id].kind === 'choice' ? <ChoiceField {...props} /> : <TypedField {...props} />}
    </div>
  );
};
