'use client';

import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { cx } from '@/lib/classNames';
import type { BikeCare } from '@/types/maintain';
import { CHECK_STEPS, dateOfStep, nameOfStep, shortDay, statusOfStep, stepKey, type CheckStep } from './checkSteps';
import { STATUS_VIEW } from './statusView';

const Row: React.FC<{ t: Translations; care: BikeCare; step: CheckStep; index: number; current: boolean; onSelect: () => void }> = ({ t, care, step, index, current, onSelect }) => {
  const status = statusOfStep(care, step);
  const date = dateOfStep(care, step);
  const { Icon, tone } = STATUS_VIEW[status];
  const g = t.care.guide;
  return (
    <button type="button" onClick={onSelect} aria-current={current ? 'step' : undefined} data-testid={`check-step-${stepKey(step)}`} data-status={status} className={cx('w-full grid grid-cols-[28px_1fr_auto] items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors', current ? 'bg-tone-info-bg' : 'hover:bg-sunken')}>
      <span className={cx('inline-flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold', tone)}>
        {status === 'unchecked' ? index + 1 : <Icon aria-hidden="true" className="w-3.5 h-3.5" />}
      </span>
      <span>
        <span className="block text-sm font-bold text-ink">{nameOfStep(t, step)}</span>
        <span className="block text-xs text-ink-3">{status === 'unchecked' ? g.time : `${t.care.status[status]}${date ? ` · ${shortDay(date)}` : ''}`}</span>
      </span>
      <span className={cx('inline-flex items-center h-6 px-2.5 rounded-full border text-[11px] font-bold whitespace-nowrap', tone)}>{status === 'unchecked' ? g.waiting : t.care.status[status]}</span>
    </button>
  );
};

/** The steps of the check as a numbered list, in the order of the walk-round: the five places of the bike, then the two tyres; the current one is marked. */
export const CheckList: React.FC<{ t: Translations; care: BikeCare; current: number; onSelect: (index: number) => void }> = ({ t, care, current, onSelect }) => {
  const nodes = CHECK_STEPS.filter((step) => step.kind === 'node');
  const tyres = CHECK_STEPS.filter((step) => step.kind === 'tyre');
  return (
    <nav aria-label={t.care.guide.listTitle} className="space-y-1" data-testid="check-list">
      {nodes.map((step) => <Row key={stepKey(step)} t={t} care={care} step={step} index={CHECK_STEPS.indexOf(step)} current={CHECK_STEPS.indexOf(step) === current} onSelect={() => onSelect(CHECK_STEPS.indexOf(step))} />)}
      <p className="px-2 pt-3 text-xs font-bold uppercase tracking-wider text-ink-3">{t.care.guide.tyresGroup}</p>
      {tyres.map((step) => <Row key={stepKey(step)} t={t} care={care} step={step} index={CHECK_STEPS.indexOf(step)} current={CHECK_STEPS.indexOf(step) === current} onSelect={() => onSelect(CHECK_STEPS.indexOf(step))} />)}
    </nav>
  );
};
