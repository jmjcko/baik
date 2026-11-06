'use client';

import React, { useMemo, useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { cx } from '@/lib/classNames';
import { PageHeader } from '@/components/primitives/PageHeader';
import { SurfaceCard } from '@/components/primitives/SurfaceCard';
import { lukeContext } from '@/lib/agents/gearPrefill';
import { STEP_COUNT } from '@/lib/gear/gearState';
import type { CurrencyId } from '@/types/gearTypes';
import type { PromptParameter } from '@/lib/agents/lukeCykloAgent';
import { promptParameters } from '@/lib/gear/parameters';
import { useUpgradeMatrix } from '@/lib/gear/useUpgradeMatrix';
import type { ProfileValues } from '@/lib/profile/values';
import { AnswersStep } from './AnswersStep';
import { InsightStep } from './InsightStep';
import { MasterPromptModal } from './MasterPromptModal';
import { ParameterPicker } from './ParameterPicker';
import { ProductForm, ProductStep } from './ProductStep';
import { PromptStep } from './PromptStep';
import { SavedPurchases } from './SavedPurchases';
import { useGearWizard } from './useGearWizard';
import { useSavedFlow } from './useSavedFlow';

const STEPS = ['product', 'parameters', 'answers', 'insight', 'prompt'] as const;
const PILL = 'h-12 px-6 rounded-full text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

/** The budget as a line of the prompt, when the rider gave a number. */
function budgetLine(t: Translations, budget: string, currency: CurrencyId): PromptParameter[] {
  return budget ? [{ label: t.gear.budget.label, value: `${budget} ${t.gear.options.currency[currency]}`, fromGarage: false }] : [];
}

const Progress: React.FC<{ t: Translations; step: number; children?: React.ReactNode }> = ({ t, step, children }) => (
  <div className="space-y-2">
    <p className="text-xs font-bold uppercase tracking-wider text-ink-2" data-testid="gear-progress">{fill(t.gear.stepOf, { n: step + 1, total: STEP_COUNT })} · {t.gear.steps[STEPS[step]]}</p>
    <div className="flex gap-1.5" aria-hidden="true">{STEPS.map((id, i) => <span key={id} className={cx('h-1.5 flex-1 rounded-full', i <= step ? 'bg-blue-600' : 'bg-sunken')} />)}</div>
    <div className="rounded-xl border-2 border-tone-info-line bg-tone-info-bg" data-testid="gear-turn">
      <div className="p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-tone-info-ink">{t.gear.turn.label}</p>
        <p className="text-lg font-bold text-ink mt-0.5" data-testid="gear-turn-title">{t.gear.turn[STEPS[step]]}</p>
        <p className="text-sm text-ink mt-1" data-testid="gear-step-help">{t.gear.stepHelp[STEPS[step]]}</p>
      </div>
      {children && <div className="border-t-2 border-tone-info-line p-4" data-testid="gear-turn-action">{children}</div>}
    </div>
  </div>
);

interface FooterProps {
  t: Translations;
  step: number;
  canGo: boolean;
  count: number;
  onGo: (step: number) => void;
  /** "Save and close": from the second step on, so that the rider can leave at any time. */
  onSave: () => void;
}

/** Back, and on to the next step (the first step goes on by its own button, which prepares the questions). */
const Footer: React.FC<FooterProps> = ({ t, step, canGo, count, onGo, onSave }) => (
  <div className="flex flex-wrap gap-3">
    <button type="button" disabled={step === 0} onClick={() => onGo(step - 1)} data-testid="gear-previous" className={cx(PILL, 'border-2 border-field-line bg-field text-ink hover:border-field-focus')}>{t.gear.previous}</button>
    {step >= 1 && <button type="button" onClick={onSave} data-testid="gear-save" className={cx(PILL, 'border-2 border-field-line bg-field text-accent-ink hover:border-field-focus')}>{t.gear.saved.saveClose}</button>}
    {step >= 1 && step < STEP_COUNT - 1 && <button type="button" disabled={!canGo} onClick={() => onGo(step + 1)} data-testid="gear-next" className={cx(PILL, 'bg-blue-600 text-slate-50 hover:bg-blue-700')}>{step === 1 ? fill(t.gear.picker.start, { n: count }) : t.gear.next}</button>}
  </div>
);

/** The bAIkgear page: a five-step wizard (the product, what matters, the answers, the rules of the knowledge base, the master prompt for the rider's own AI chatbot). */
export const GearView: React.FC<{ t: Translations; locale: 'en' | 'cs'; values: ProfileValues; riderLabel?: string; bikeId?: string }> = ({ t, locale, values, riderLabel, bikeId = 'current' }) => {
  const wizard = useGearWizard(t, locale, values);
  const { state } = wizard;
  const saved = useSavedFlow(t, wizard);
  const [open, setOpen] = useState(false);
  const context = useMemo(() => lukeContext(values), [values]);
  const upgrades = useUpgradeMatrix(values, bikeId);
  const { parameters: list, selected, answers, budget, currency } = state;
  const parameters = useMemo(() => [...promptParameters(list, new Set(selected), answers), ...budgetLine(t, budget, currency)], [t, list, selected, answers, budget, currency]);
  const chosen = state.parameters.filter((one) => state.selected.includes(one.id));
  return (
    <div className="space-y-6 pb-10" data-testid="gear-view">
      <PageHeader eyebrow={t.navigation.baikshopAdvisory} title={t.gear.title} subtitle={t.gear.subtitle} />
      {saved.notice && (state.step === 0 || saved.notice.kind === 'full') && <p role="status" data-testid="saved-notice" className={cx('rounded-xl border p-3 text-sm font-semibold', saved.notice.kind === 'saved' ? 'border-tone-success-line bg-tone-success-bg text-tone-success-ink' : 'border-tone-warning-line bg-tone-warning-bg text-tone-warning-ink')}>{saved.notice.text}</p>}
      {state.step === 0 && <SavedPurchases t={t} locale={locale} purchases={saved.purchases} onOpen={saved.open} onDelete={saved.remove} onDone={saved.markDone} />}
      <SurfaceCard as="section" padding="lg" className="space-y-5">
        <Progress t={t} step={state.step}>
          {state.step === 0 && <ProductForm t={t} query={state.query} onQuery={wizard.setQuery} onSubmit={() => wizard.find()} />}
        </Progress>
        {state.step === 0 && <ProductStep t={t} onFind={wizard.find} />}
        {state.step === 1 && <ParameterPicker t={t} state={state} onToggle={wizard.toggle} onRemove={wizard.remove} onAdd={wizard.add} onReset={wizard.reset} onRetry={() => wizard.find(state.category ?? undefined)} />}
        {state.step === 2 && <AnswersStep t={t} locale={locale} parameters={chosen} answers={state.answers} budget={state.budget} currency={state.currency} onAnswer={wizard.answer} onBudget={wizard.setBudget} onCurrency={wizard.setCurrency} />}
        {state.step === 3 && <InsightStep t={t} category={state.category} matrix={upgrades} />}
        {state.step === 4 && <PromptStep t={t} parameters={parameters} notes={state.notes} onNotes={wizard.setNotes} onOpen={() => setOpen(true)} />}
        <Footer t={t} step={state.step} canGo={state.status === 'ready' && state.selected.length > 0} count={state.selected.length} onGo={wizard.goTo} onSave={saved.saveAndClose} />
      </SurfaceCard>
      {open && <MasterPromptModal t={t} input={{ productTitle: state.title, category: state.category, parameters, notes: state.notes, upgrades, ...context }} riderLabel={riderLabel} onClose={() => setOpen(false)} />}
    </div>
  );
};
