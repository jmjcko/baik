'use client';


import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { cx } from '@/lib/classNames';
import type { NodeStatus } from '@/types/maintain';
import { STATUS_VIEW } from './statusView';

const RESULTS = ['pass', 'warn', 'fail'] as const;

interface ResultProps {
  t: Translations;
  status: NodeStatus;
  onSetStatus: (status: NodeStatus) => void;
  /** The prefix of the test ids: "node" for a node of the M-Check, "tyre" for a tyre. */
  testPrefix?: string;
  /** The small heading over the buttons; a step that has its own heading leaves it out. */
  showLabel?: boolean;
}

/** The three results of a node: PASS, WARN, FAIL; the pressed one is the finding, and it can be taken back. */
export const ResultButtons: React.FC<ResultProps> = ({ t, status, onSetStatus, testPrefix = 'node', showLabel = true }) => (
  <div className="space-y-2">
    {showLabel && <p className="text-xs font-semibold uppercase tracking-wide text-ink-3">{t.care.node.setStatus}</p>}
    <div className="flex flex-wrap gap-2">
      {RESULTS.map((result) => {
        const { Icon, tone } = STATUS_VIEW[result];
        return (
          <button key={result} type="button" aria-pressed={status === result} onClick={() => onSetStatus(result)} data-testid={`${testPrefix}-result-${result}`} className={cx('h-12 px-5 rounded-full border-2 text-sm font-bold inline-flex items-center gap-2 transition-colors', status === result ? tone : 'border-line bg-surface text-ink-2 hover:bg-sunken')}>
            <Icon aria-hidden="true" className="w-4 h-4" />
            {t.care.verdictLabel[result]}
            <span className="font-medium text-xs">{t.care.status[result]}</span>
          </button>
        );
      })}
      {status !== 'unchecked' && (
        <button type="button" onClick={() => onSetStatus('unchecked')} className="h-12 px-5 rounded-full border border-line bg-surface text-sm font-semibold text-ink-2 hover:bg-sunken">{t.care.node.reset}</button>
      )}
    </div>
  </div>
);
