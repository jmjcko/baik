import React, { useState } from 'react';
import { Check, ChevronDown, Loader2, Plus, RotateCcw, X } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { cx } from '@/lib/classNames';
import type { GearParameter } from '@/types/gearTypes';
import type { GearState } from '@/lib/gear/gearState';

interface PickerProps {
  t: Translations;
  state: GearState;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onAdd: (name: string) => void;
  onReset: () => void;
  /** Asks the research again for the same product. */
  onRetry: () => void;
}

/** One card: a check to use the question or not, its name and why it matters, and a cross to take it off the list. */
const ParameterCard: React.FC<{ t: Translations; parameter: GearParameter; used: boolean; onToggle: () => void; onRemove: () => void }> = ({ t, parameter, used, onToggle, onRemove }) => (
  <li className="rounded-xl border border-line bg-surface p-3 flex items-start gap-3" data-testid={`parameter-${parameter.id}`}>
    <button type="button" role="checkbox" aria-checked={used} aria-label={fill(t.gear.picker.select, { name: parameter.label })} onClick={onToggle} className={cx('mt-0.5 h-5 w-5 shrink-0 rounded border-2 inline-flex items-center justify-center', used ? 'bg-blue-600 border-blue-600 text-slate-50' : 'border-line bg-surface')}>
      {used && <Check aria-hidden="true" className="w-3.5 h-3.5" />}
    </button>
    <span className="flex-1 min-w-0">
      <span className="block text-sm font-bold text-ink">{parameter.label}</span>
      <span className="block text-xs text-ink-2 mt-0.5">{parameter.hint}</span>
      {parameter.source === 'kb' && <span className="inline-block mt-1.5 text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border border-tone-info-line bg-tone-info-bg text-tone-info-ink" data-testid={`kb-${parameter.id}`}>{t.gear.picker.fromKb}</span>}
    </span>
    <button type="button" onClick={onRemove} aria-label={fill(t.gear.picker.remove, { name: parameter.label })} data-testid={`remove-${parameter.id}`} className="h-8 w-8 shrink-0 rounded-full text-ink-3 hover:bg-sunken inline-flex items-center justify-center"><X aria-hidden="true" className="w-4 h-4" /></button>
  </li>
);

/** The card that adds a criterion of the rider's own. */
const AddCard: React.FC<{ t: Translations; onAdd: (name: string) => void }> = ({ t, onAdd }) => {
  const [name, setName] = useState('');
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (name.trim()) { onAdd(name); setName(''); } };
  return (
    <li className="rounded-xl border-2 border-dashed border-tone-info-line bg-tone-info-bg p-3" data-testid="add-parameter">
      <form onSubmit={submit} className="space-y-2">
        <p className="text-sm font-bold text-accent-ink flex items-center gap-2"><Plus aria-hidden="true" className="w-4 h-4" />{t.gear.picker.addTitle}</p>
        <p className="text-xs text-ink-2">{t.gear.picker.addHint}</p>
        <span className="flex gap-2">
          <input type="text" value={name} maxLength={60} placeholder={t.gear.picker.addPlaceholder} aria-label={t.gear.picker.addPlaceholder} onChange={(e) => setName(e.target.value)} data-testid="custom-name" className="h-10 flex-1 rounded-xl border border-line bg-surface px-3 text-sm text-ink" />
          <button type="submit" disabled={!name.trim()} data-testid="custom-add" className="h-10 px-4 rounded-full bg-blue-600 text-slate-50 text-xs font-semibold disabled:opacity-50">{t.gear.picker.add}</button>
        </span>
      </form>
    </li>
  );
};

const NOTES = { out_of_scope: 'outOfScope', rate_limited: 'rateLimited' } as const;

/** The notice of why the standard questions are shown, if they are, with a button to try again when trying again can help. */
const FallbackNote: React.FC<{ t: Translations; fallback: GearState['fallback']; onRetry: () => void }> = ({ t, fallback, onRetry }) => {
  if (!fallback) return null;
  const key = (NOTES as Record<string, 'outOfScope' | 'rateLimited'>)[fallback] ?? 'fallback';
  const again = fallback === 'unavailable' || fallback === 'unreadable';
  return (
    <div role="status" data-testid="picker-fallback" className="rounded-xl border border-tone-warning-line bg-tone-warning-bg p-3 text-sm text-tone-warning-ink flex flex-wrap items-center justify-between gap-3">
      <p>{t.gear.picker[key]}</p>
      {again && <button type="button" onClick={onRetry} data-testid="picker-retry" className="h-10 px-4 rounded-full border border-tone-warning-line bg-surface text-xs font-semibold text-ink hover:bg-sunken">{t.gear.picker.retry}</button>}
    </div>
  );
};

interface GroupProps {
  title: string;
  testId: string;
  children: React.ReactNode;
}

const Group: React.FC<GroupProps> = ({ title, testId, children }) => (
  <section className="space-y-2" data-testid={testId} aria-label={title}>
    <h4 className="text-xs font-bold uppercase tracking-wider text-ink-3">{title}</h4>
    <ul className="grid gap-3 md:grid-cols-2">{children}</ul>
  </section>
);

/** The optional questions, folded away until the rider asks for them. */
const MoreCriteria: React.FC<{ t: Translations; count: number; children: React.ReactNode }> = ({ t, count, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-3">
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} data-testid="more-toggle" className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-ink">
        {open ? t.gear.picker.moreHide : fill(t.gear.picker.moreShow, { n: count })}
        <ChevronDown aria-hidden="true" className={cx('w-4 h-4 transition-transform', open && 'rotate-180')} />
      </button>
      {open && <Group title={t.gear.picker.groupMore} testId="group-more">{children}</Group>}
    </div>
  );
};

/** The questions in groups: those of the knowledge base, the suggested ones, the optional ones (folded) and the rider's own. */
function groupsOf(parameters: GearParameter[]) {
  return {
    kb: parameters.filter((one) => one.source === 'kb'),
    suggested: parameters.filter((one) => one.source !== 'kb' && one.source !== 'custom' && one.importance !== 'optional'),
    more: parameters.filter((one) => one.source !== 'kb' && one.source !== 'custom' && one.importance === 'optional'),
    own: parameters.filter((one) => one.source === 'custom'),
  };
}

/** Step 2: the questions that matter for the product as cards; the rider keeps, removes or adds them. */
export const ParameterPicker: React.FC<PickerProps> = ({ t, state, onToggle, onRemove, onAdd, onReset, onRetry }) => {
  const p = t.gear.picker;
  const groups = groupsOf(state.parameters);
  if (state.status === 'loading') return <p role="status" className="flex items-center gap-3 text-sm font-semibold text-ink py-8" data-testid="picker-loading"><Loader2 aria-hidden="true" className="w-5 h-5 animate-spin" />{p.loading}</p>;
  const card = (parameter: GearParameter) => <ParameterCard key={parameter.id} t={t} parameter={parameter} used={state.selected.includes(parameter.id)} onToggle={() => onToggle(parameter.id)} onRemove={() => onRemove(parameter.id)} />;
  return (
    <div className="space-y-5" data-testid="gear-parameters-step">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-ink" data-testid="picker-title">{fill(p.title, { product: state.title })}</h3>
          <p className="text-sm text-ink-2 mt-1">{p.intro} {p.recommended}</p>
        </div>
        <button type="button" onClick={onReset} data-testid="picker-reset" className="h-10 px-4 rounded-full border border-line bg-surface text-xs font-semibold text-ink-2 hover:bg-sunken inline-flex items-center gap-2"><RotateCcw aria-hidden="true" className="w-3.5 h-3.5" />{p.reset}</button>
      </div>
      <FallbackNote t={t} fallback={state.fallback} onRetry={onRetry} />
      {groups.kb.length > 0 && <Group title={p.groupKb} testId="group-kb">{groups.kb.map(card)}</Group>}
      {groups.suggested.length > 0 && <Group title={p.groupSuggested} testId="group-suggested">{groups.suggested.map(card)}</Group>}
      {groups.more.length > 0 && <MoreCriteria t={t} count={groups.more.length}>{groups.more.map(card)}</MoreCriteria>}
      <Group title={p.groupOwn} testId="group-own">
        {groups.own.map(card)}
        <AddCard t={t} onAdd={onAdd} />
      </Group>
      <p className="font-mono text-xs text-accent-ink" data-testid="picker-count">{fill(p.selected, { n: state.selected.length, total: state.parameters.length })}</p>
    </div>
  );
};
