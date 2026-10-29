'use client';

import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { cx } from '@/lib/classNames';
import { CATEGORY_PARAMETERS, MAX_TEXT_ANSWER, PARAMETER_OPTIONS, kindOf, type FinderAnswers, type FinderCategory, type FinderParameterId } from '@/lib/finder/parameters';
import type { RecommendErrorCode } from '@/lib/finder/types';

const PILL = 'h-12 px-6 rounded-full text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
const CHIP = 'min-h-12 px-4 py-2 rounded-2xl border text-left text-sm font-semibold transition-colors';

interface QuestionProps {
  t: Translations;
  id: FinderParameterId;
  values: string[];
  onChange: (values: string[]) => void;
}

/** A single question keeps one option; a multiple one keeps several, and "none" stands alone. */
function toggled(values: string[], option: string, multi: boolean): string[] {
  if (values.includes(option)) return values.filter((value) => value !== option);
  if (!multi || option === 'none') return [option];
  return [...values.filter((value) => value !== 'none'), option];
}

const Chips: React.FC<QuestionProps> = ({ t, id, values, onChange }) => {
  const texts = t.finder.parameters[id].options as Record<string, string>;
  const multi = kindOf(id) === 'multi';
  return (
    <div role="group" aria-label={t.finder.parameters[id].name} className="flex flex-wrap gap-2">
      {PARAMETER_OPTIONS[id].map((option) => (
        <button key={option} type="button" aria-pressed={values.includes(option)} onClick={() => onChange(toggled(values, option, multi))} className={cx(CHIP, values.includes(option) ? 'border-blue-600 bg-blue-600 text-slate-50' : 'border-line bg-surface text-ink hover:bg-sunken')}>
          {texts[option]}
        </button>
      ))}
    </div>
  );
};

const TextAnswer: React.FC<QuestionProps> = ({ t, id, values, onChange }) => (
  <input
    type="text"
    aria-label={t.finder.parameters[id].name}
    value={values[0] ?? ''}
    maxLength={MAX_TEXT_ANSWER}
    placeholder={t.finder.textPlaceholder}
    onChange={(e) => onChange(e.target.value === '' ? [] : [e.target.value])}
    className="w-full h-12 rounded-xl border border-line bg-surface px-4 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-blue-500"
  />
);

interface FinderQuestionsProps {
  t: Translations;
  category: FinderCategory;
  answers: FinderAnswers;
  step: number;
  working: boolean;
  error: RecommendErrorCode | null;
  onAnswer: (id: FinderParameterId, values: string[]) => void;
  onStep: (step: number) => void;
  onSubmit: () => void;
}

const ProgressBar: React.FC<{ label: string; ratio: number }> = ({ label, ratio }) => (
  <div>
    <p className="text-xs font-semibold text-ink-3">{label}</p>
    <div className="w-full bg-sunken h-2 rounded-full overflow-hidden border border-line mt-2" aria-hidden="true">
      <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: `${ratio * 100}%` }} />
    </div>
  </div>
);

interface NavProps {
  t: Translations;
  step: number;
  last: boolean;
  answered: boolean;
  working: boolean;
  onStep: (step: number) => void;
  onSubmit: () => void;
}

const Nav: React.FC<NavProps> = ({ t, step, last, answered, working, onStep, onSubmit }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
    <button type="button" disabled={step === 0 || working} onClick={() => onStep(step - 1)} className={`${PILL} border border-line bg-surface text-ink-2 hover:bg-sunken`}>{t.finder.back}</button>
    {last ? (
      <button type="button" disabled={working} onClick={onSubmit} className={`${PILL} bg-blue-600 hover:bg-blue-700 text-slate-50 shadow-md`}>{working ? t.finder.working : t.finder.seeResults}</button>
    ) : (
      <button type="button" onClick={() => onStep(step + 1)} className={`${PILL} bg-blue-600 hover:bg-blue-700 text-slate-50 shadow-md`}>{answered ? t.finder.next : t.finder.skip}</button>
    )}
  </div>
);

/** One question at a time: chips for a choice, a field for a text; every question may be skipped. The last one offers the suggestion. */
export const FinderQuestions: React.FC<FinderQuestionsProps> = ({ t, category, answers, step, working, error, onAnswer, onStep, onSubmit }) => {
  const ids = CATEGORY_PARAMETERS[category];
  const id = ids[Math.min(step, ids.length - 1)];
  const values = answers[id] ?? [];
  const Answer = kindOf(id) === 'text' ? TextAnswer : Chips;
  return (
    <div className="space-y-5" data-testid="finder-question">
      <ProgressBar label={fill(t.finder.progress, { n: step + 1, total: ids.length })} ratio={(step + 1) / ids.length} />
      <div>
        <h3 className="text-lg font-bold text-ink tracking-tight">{t.finder.parameters[id].name}</h3>
        <p className="text-sm text-ink-2 leading-relaxed mt-1">{t.finder.parameters[id].why}</p>
        <p className="text-xs text-ink-3 mt-1">{t.finder.optional}</p>
      </div>
      <Answer t={t} id={id} values={values} onChange={(next) => onAnswer(id, next)} />
      {error && <p role="alert" className="p-3 rounded-xl border border-tone-danger-line bg-tone-danger-bg text-tone-danger-ink text-xs">{t.finder.errors[error]}</p>}
      <Nav t={t} step={step} last={step >= ids.length - 1} answered={values.length > 0} working={working} onStep={onStep} onSubmit={onSubmit} />
    </div>
  );
};
