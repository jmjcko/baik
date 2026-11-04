'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { cx } from '@/lib/classNames';
import { tyreAttention } from '@/lib/engines/baikcare/mcheck';
import { sealantAlert } from '@/lib/engines/baikcare/sealant';
import type { BikeCare, NodeStatus } from '@/types/maintain';
import { STATUS_VIEW } from './statusView';

export const CARE_TASKS = ['chain', 'wheels', 'trainer', 'fix', 'wash'] as const;
export type CareTaskId = (typeof CARE_TASKS)[number];

/** The state of the wheels and tyres task: a sealant that is due or overdue and the tyres that were found worn; the other tasks hold no state of their own. */
export function wheelsStatus(care: BikeCare, today: string): NodeStatus | null {
  const sealant = sealantAlert(care, today);
  if (sealant === 'overdue') return 'fail';
  if (sealant === 'topUp' || tyreAttention(care).length > 0) return 'warn';
  return null;
}

const StateIcon: React.FC<{ t: Translations; task: CareTaskId; status: NodeStatus }> = ({ t, task, status }) => {
  const { Icon, tone } = STATUS_VIEW[status];
  return (
    <span data-testid={`task-${task}-status`} aria-label={t.care.status[status]} role="img" className={cx('inline-flex h-6 w-6 items-center justify-center rounded-full border', tone)}>
      <Icon aria-hidden="true" className="w-3.5 h-3.5" />
    </span>
  );
};

interface TasksProps {
  t: Translations;
  care: BikeCare;
  today: string;
  open: CareTaskId | null;
  onToggle: (task: CareTaskId) => void;
}

/** The things that are done by time, under the check: the chain, the wheels and tyres, the trainer, the troubleshooter and the wash; one opens at a time below the row. */
export const CareTasks: React.FC<TasksProps> = ({ t, care, today, open, onToggle }) => {
  const g = t.care.guide;
  return (
    <section className="space-y-3" data-testid="care-tasks" aria-labelledby="care-tasks-title">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-ink-3">{g.tasksLabel}</p>
        <h2 id="care-tasks-title" className="text-lg font-bold text-ink tracking-tight">{g.tasksTitle}</h2>
        <p className="text-xs text-ink-3 mt-0.5">{g.tasksHint}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {CARE_TASKS.map((task) => {
          const status = task === 'wheels' ? wheelsStatus(care, today) : null;
          return (
            <button key={task} type="button" aria-expanded={open === task} aria-controls="care-panel" onClick={() => onToggle(task)} data-testid={`task-${task}`} className={cx('rounded-2xl border p-4 text-left space-y-1 transition-colors', open === task ? 'border-blue-600 bg-tone-info-bg' : 'border-line bg-surface hover:bg-sunken')}>
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-ink">{g.tasks[task].title}</span>
                <span className="flex items-center gap-1.5 shrink-0">
                  {status && <StateIcon t={t} task={task} status={status} />}
                  <ChevronDown aria-hidden="true" className={cx('w-4 h-4 text-ink-3 transition-transform', open === task && 'rotate-180')} />
                </span>
              </span>
              <span className="block text-xs text-ink-2 leading-relaxed">{g.tasks[task].text}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
