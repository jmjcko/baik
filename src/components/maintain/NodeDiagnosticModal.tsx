'use client';

import React from 'react';
import { X } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { cx } from '@/lib/classNames';
import { useEscape } from '@/lib/hooks/useEscape';
import type { WireframeKind } from '@/components/studio/wireframe/geometry';
import type { MCheckNodeId, NodeStatus } from '@/types/maintain';
import { NodeDiagram } from './NodeDiagram';
import { STATUS_VIEW } from './statusView';

const RESULTS = ['pass', 'warn', 'fail'] as const;

interface ModalProps {
  t: Translations;
  node: MCheckNodeId;
  status: NodeStatus;
  kind: WireframeKind;
  onSetStatus: (status: NodeStatus) => void;
  onClose: () => void;
}

/** The three results of a node: PASS, WARN, FAIL; the pressed one is the finding, and it can be taken back. */
const ResultButtons: React.FC<Pick<ModalProps, 't' | 'status' | 'onSetStatus'>> = ({ t, status, onSetStatus }) => (
  <div className="space-y-2">
    <p className="text-xs font-semibold uppercase tracking-wide text-ink-3">{t.care.node.setStatus}</p>
    <div className="flex flex-wrap gap-2">
      {RESULTS.map((result) => {
        const { Icon, tone } = STATUS_VIEW[result];
        return (
          <button key={result} type="button" aria-pressed={status === result} onClick={() => onSetStatus(result)} data-testid={`node-result-${result}`} className={cx('h-12 px-5 rounded-full border-2 text-sm font-bold inline-flex items-center gap-2 transition-colors', status === result ? tone : 'border-line bg-surface text-ink-2 hover:bg-sunken')}>
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

const NodeHeader: React.FC<{ t: Translations; node: MCheckNodeId; onClose: () => void }> = ({ t, node, onClose }) => {
  const texts = t.care.nodes[String(node) as '1'];
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="font-mono text-[11px] uppercase text-ink-3">{`${node} / 5`}</p>
        <h2 id="node-title" className="text-lg font-bold text-ink tracking-tight">{texts.name}</h2>
        <p className="text-sm text-ink-2 leading-relaxed mt-1">{texts.intro}</p>
      </div>
      <button type="button" onClick={onClose} aria-label={t.care.node.close} className="h-10 w-10 shrink-0 rounded-full border border-line bg-surface text-ink-2 hover:bg-sunken inline-flex items-center justify-center">
        <X aria-hidden="true" className="w-4 h-4" />
      </button>
    </div>
  );
};

/** The numbered checks of a node. */
const NodeSteps: React.FC<{ t: Translations; node: MCheckNodeId }> = ({ t, node }) => (
  <div className="space-y-2">
    <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-3">{t.care.node.stepsTitle}</h3>
    <ol className="space-y-2" data-testid="node-steps">
      {t.care.nodes[String(node) as '1'].steps.map((step, index) => (
        <li key={step} className="flex gap-3 text-sm text-ink leading-relaxed">
          <span aria-hidden="true" className="mt-0.5 h-6 w-6 shrink-0 rounded-full bg-tone-info-bg border border-tone-info-line text-tone-info-ink text-xs font-bold inline-flex items-center justify-center">{index + 1}</span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  </div>
);

/** The diagnostic card of one node: what it is, where it sits, the numbered steps of the check and the result. */
export const NodeDiagnosticModal: React.FC<ModalProps> = ({ t, node, status, kind, onSetStatus, onClose }) => {
  useEscape(onClose);
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="node-title" data-testid="node-dialog" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-line bg-surface p-6 shadow-xl space-y-5">
        <NodeHeader t={t} node={node} onClose={onClose} />
        <NodeDiagram t={t} node={node} kind={kind} />
        <NodeSteps t={t} node={node} />
        <ResultButtons t={t} status={status} onSetStatus={onSetStatus} />
      </div>
    </div>
  );
};
