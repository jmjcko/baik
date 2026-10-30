import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { cx } from '@/lib/classNames';
import type { GearAnswer, GearParameter } from '@/types/gearTypes';

interface FieldProps {
  t: Translations;
  parameter: GearParameter;
  answer: GearAnswer | undefined;
  onChange: (answer: GearAnswer | null) => void;
}

const INPUT = 'h-12 w-full rounded-xl border border-line bg-surface px-4 text-sm text-ink';
const SEPARATOR = ', ';

const chosenOf = (answer: GearAnswer | undefined): string[] => (answer ? String(answer.value).split(SEPARATOR).filter(Boolean) : []);

/** A number or a short text; an empty field is no answer, and a number that cannot be read is not kept. */
const TypedField: React.FC<FieldProps & { testId: string; label: string; placeholder?: string }> = ({ parameter, answer, onChange, testId, label, placeholder }) => {
  const isNumber = parameter.kind === 'number';
  const change = (text: string) => {
    const value = isNumber ? Number(text.replace(',', '.')) : text;
    onChange(text.trim() === '' || (isNumber && !Number.isFinite(value)) ? null : { value, fromGarage: false });
  };
  return (
    <div className="flex items-center gap-2">
      <input type="text" inputMode={isNumber ? 'decimal' : 'text'} maxLength={isNumber ? 12 : 80} aria-label={label} placeholder={placeholder} value={answer ? String(answer.value) : ''} onChange={(e) => change(e.target.value)} data-testid={testId} className={INPUT} />
      {parameter.unit && <span className="text-xs font-mono text-ink-3 shrink-0">{parameter.unit}</span>}
    </div>
  );
};

/** A question answered by pressing a card; with several values allowed the cards are toggles, with one value pressing the chosen card again takes it back. */
const ChoiceField: React.FC<FieldProps> = ({ parameter, answer, onChange }) => {
  const chosen = chosenOf(answer);
  const press = (value: string) => {
    const next = parameter.multi ? (chosen.includes(value) ? chosen.filter((one) => one !== value) : [...chosen, value]) : chosen.includes(value) ? [] : [value];
    onChange(next.length === 0 ? null : { value: next.join(SEPARATOR), fromGarage: false });
  };
  return (
    <div role="group" aria-label={parameter.label} className="flex flex-wrap gap-2">
      {(parameter.options ?? []).map((option) => (
        <button key={option.value} type="button" aria-pressed={chosen.includes(option.value)} onClick={() => press(option.value)} data-testid={`param-${parameter.id}-${option.value}`} className={cx('min-h-10 px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors text-left', chosen.includes(option.value) ? 'bg-blue-600 border-blue-600 text-slate-50' : 'border-line bg-surface text-ink-2 hover:bg-sunken')}>
          {option.label}
        </button>
      ))}
    </div>
  );
};

/** The suggested values of a question from the research also take an answer of the rider's own. */
const OwnAnswer: React.FC<FieldProps> = (props) => {
  const own = props.answer && !props.parameter.options?.some((option) => props.answer?.value === option.value) && !String(props.answer.value).includes(SEPARATOR);
  return <TypedField {...props} answer={own ? props.answer : undefined} testId={`param-${props.parameter.id}-own`} label={`${props.parameter.label}: ${props.t.gear.ownAnswer}`} placeholder={props.t.gear.ownAnswer} />;
};

/** The brands: the ones the rider wants and the ones the rider does not, written as one answer. */
const BrandsField: React.FC<FieldProps> = ({ t, parameter, answer, onChange }) => {
  const b = t.gear.brands;
  const parts = String(answer?.value ?? '').split('; ');
  const part = (prefix: string) => parts.find((one) => one.startsWith(`${prefix}: `))?.slice(prefix.length + 2) ?? '';
  const set = (preferred: string, avoid: string) => {
    const text = [preferred && `${b.preferredValue}: ${preferred}`, avoid && `${b.avoidValue}: ${avoid}`].filter(Boolean).join('; ');
    onChange(text ? { value: text, fromGarage: false } : null);
  };
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <input type="text" maxLength={60} aria-label={b.preferred} placeholder={b.preferred} value={part(b.preferredValue)} onChange={(e) => set(e.target.value.replace(/;/g, ','), part(b.avoidValue))} data-testid={`param-${parameter.id}-preferred`} className={INPUT} />
      <input type="text" maxLength={60} aria-label={b.avoid} placeholder={b.avoid} value={part(b.avoidValue)} onChange={(e) => set(part(b.preferredValue), e.target.value.replace(/;/g, ','))} data-testid={`param-${parameter.id}-avoid`} className={INPUT} />
    </div>
  );
};

const Field: React.FC<FieldProps> = (props) => {
  if (props.parameter.kind === 'brands') return <BrandsField {...props} />;
  if (props.parameter.kind === 'choice') return <ChoiceField {...props} />;
  return <TypedField {...props} testId={`param-${props.parameter.id}`} label={props.parameter.label} />;
};

/** One question of the wizard: its label, why it matters, the field, and a note when the first value came from the garage. */
export const ParamField: React.FC<FieldProps> = (props) => {
  const { t, parameter, answer } = props;
  return (
    <div className="rounded-xl border border-line p-4 space-y-2" data-testid={`field-${parameter.id}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold text-ink">{parameter.label}</p>
        {answer?.fromGarage && <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border border-tone-info-line bg-tone-info-bg text-tone-info-ink" data-testid={`garage-${parameter.id}`}>{t.gear.fromGarage}</span>}
      </div>
      {parameter.hint && <p className="text-xs text-ink-2">{parameter.hint}</p>}
      <Field {...props} />
      {parameter.kind === 'choice' && parameter.source === 'ai' && <OwnAnswer {...props} />}
    </div>
  );
};
