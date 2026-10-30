'use client';

import React from 'react';
import { X } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { useEscape } from '@/lib/hooks/useEscape';
import type { WireframeKind } from '@/components/studio/wireframe/geometry';
import type { NodeStatus, WheelId } from '@/types/maintain';
import { ResultButtons } from './NodeDiagnosticModal';
import { TyreDiagram } from './TyreDiagram';

interface TyreDialogProps {
  t: Translations;
  wheel: WheelId;
  status: NodeStatus;
  kind: WireframeKind;
  onSetStatus: (status: NodeStatus) => void;
  onOpenFlat: () => void;
  onClose: () => void;
}

const TyreHeader: React.FC<Pick<TyreDialogProps, 't' | 'wheel' | 'onClose'>> = ({ t, wheel, onClose }) => (
  <div className="flex items-start justify-between gap-4">
    <div>
      <h2 id="tyre-title" className="text-lg font-bold text-ink tracking-tight">{t.wheels.points[wheel]}</h2>
      <p className="text-sm text-ink-2 leading-relaxed mt-1">{t.wheels.points.intro}</p>
    </div>
    <button type="button" onClick={onClose} aria-label={t.wheels.points.close} className="h-10 w-10 shrink-0 rounded-full border border-line bg-surface text-ink-2 hover:bg-sunken inline-flex items-center justify-center">
      <X aria-hidden="true" className="w-4 h-4" />
    </button>
  </div>
);

/** The four checks of a tyre and its rim: the tread, the casing, the rim wear and the rim tape (the criteria of the wheels and tyres card). */
const TyreSteps: React.FC<{ t: Translations }> = ({ t }) => (
  <div className="space-y-2">
    <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-3">{t.wheels.points.stepsTitle}</h3>
    <ol className="space-y-2" data-testid="tyre-steps">
      {t.wheels.wear.items.map((item, index) => (
        <li key={item.title} className="flex gap-3 text-sm text-ink leading-relaxed">
          <span aria-hidden="true" className="mt-0.5 h-6 w-6 shrink-0 rounded-full bg-tone-info-bg border border-tone-info-line text-tone-info-ink text-xs font-bold inline-flex items-center justify-center">{index + 1}</span>
          <span><span className="font-semibold">{item.title}: </span>{item.body}</span>
        </li>
      ))}
    </ol>
  </div>
);

/** The diagnostic card of one tyre and rim: where it sits, the four checks, the result and the way to the flat repair guide. */
export const TyreDialog: React.FC<TyreDialogProps> = ({ t, wheel, status, kind, onSetStatus, onOpenFlat, onClose }) => {
  useEscape(onClose);
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="tyre-title" data-testid="tyre-dialog" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-line bg-surface p-6 shadow-xl space-y-5">
        <TyreHeader t={t} wheel={wheel} onClose={onClose} />
        <TyreDiagram t={t} wheel={wheel} kind={kind} />
        <TyreSteps t={t} />
        <ResultButtons t={t} status={status} onSetStatus={onSetStatus} />
        <button type="button" onClick={onOpenFlat} data-testid="tyre-open-flat" className="h-12 px-6 rounded-full border border-line bg-surface text-sm font-semibold text-accent-ink hover:bg-sunken transition-colors">{t.wheels.points.openFlat}</button>
      </div>
    </div>
  );
};
