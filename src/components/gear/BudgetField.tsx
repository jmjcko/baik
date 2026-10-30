import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { cx } from '@/lib/classNames';
import { CURRENCIES, type CurrencyId } from '@/types/gearTypes';

interface BudgetFieldProps {
  t: Translations;
  locale: 'en' | 'cs';
  budget: string;
  currency: CurrencyId;
  onBudget: (budget: string) => void;
  onCurrency: (currency: CurrencyId) => void;
}

/** The budget: a number and its currency in one card (the euro or the dollar in English, the crown or the euro in Czech). It is never a question to take off the list. */
export const BudgetField: React.FC<BudgetFieldProps> = ({ t, locale, budget, currency, onBudget, onCurrency }) => (
  <div className="rounded-xl border border-line p-4 space-y-2" data-testid="budget-field">
    <p className="text-sm font-bold text-ink">{t.gear.budget.label}</p>
    <p className="text-xs text-ink-2">{t.gear.budget.hint}</p>
    <div className="flex flex-wrap items-center gap-2">
      <input type="text" inputMode="decimal" maxLength={9} aria-label={t.gear.budget.label} placeholder={t.gear.budget.placeholder} value={budget} onChange={(e) => onBudget(e.target.value.replace(/[^0-9]/g, ''))} data-testid="budget-amount" className="h-12 w-40 rounded-xl border border-line bg-surface px-4 text-sm text-ink" />
      <div role="group" aria-label={t.gear.budget.currencyLabel} className="flex gap-2">
        {CURRENCIES[locale].map((id) => (
          <button key={id} type="button" aria-pressed={currency === id} onClick={() => onCurrency(id)} data-testid={`budget-currency-${id}`} className={cx('h-10 px-4 rounded-full text-xs font-semibold border transition-colors', currency === id ? 'bg-blue-600 border-blue-600 text-slate-50' : 'border-line bg-surface text-ink-2 hover:bg-sunken')}>{t.gear.options.currency[id]}</button>
        ))}
      </div>
    </div>
  </div>
);
