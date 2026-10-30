import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import type { CurrencyId, GearAnswer, GearAnswerMap, GearParameter } from '@/types/gearTypes';
import { BudgetField } from './BudgetField';
import { ParamField } from './ParamField';

interface AnswersStepProps {
  t: Translations;
  locale: 'en' | 'cs';
  parameters: GearParameter[];
  answers: GearAnswerMap;
  budget: string;
  currency: CurrencyId;
  onAnswer: (id: string, answer: GearAnswer | null) => void;
  onBudget: (budget: string) => void;
  onCurrency: (currency: CurrencyId) => void;
}

/** Step 3: one field for each chosen question and the budget; every one is optional, and what the garage knows is filled in. */
export const AnswersStep: React.FC<AnswersStepProps> = ({ t, locale, parameters, answers, budget, currency, onAnswer, onBudget, onCurrency }) => (
  <div className="space-y-4" data-testid="gear-answers-step">
    <p className="text-sm text-ink-2">{t.gear.answersIntro}</p>
    <div className="grid gap-3 md:grid-cols-2">
      {parameters.map((parameter) => <ParamField key={parameter.id} t={t} parameter={parameter} answer={answers[parameter.id]} onChange={(answer) => onAnswer(parameter.id, answer)} />)}
      <BudgetField t={t} locale={locale} budget={budget} currency={currency} onBudget={onBudget} onCurrency={onCurrency} />
    </div>
  </div>
);
