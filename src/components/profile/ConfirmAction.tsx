'use client';

import React, { useState } from 'react';
import type { ConfirmTexts } from '@/lib/i18n/types/profile';
import { PILL_DANGER, PILL_OUTLINE } from './ProfileParts';

interface ConfirmActionProps {
  texts: ConfirmTexts;
  doneText?: string;
  /** Runs the action; false means it failed and nothing was changed. */
  onConfirm: () => Promise<boolean>;
}

/** State of the two step action: closed, asking, running, and the outcome of the last run. */
function useConfirmAction(onConfirm: () => Promise<boolean>) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<'done' | 'failed' | null>(null);

  const run = async () => {
    setBusy(true);
    setOutcome(null);
    const ok = await onConfirm();
    setBusy(false);
    setOutcome(ok ? 'done' : 'failed');
    if (ok) setOpen(false);
  };

  return {
    open, busy, outcome, run,
    ask: () => { setOutcome(null); setOpen(true); },
    cancel: () => { setOutcome(null); setOpen(false); },
  };
}

/** A destructive action behind an explicit second step: the button opens a short confirmation, only its confirm button runs the action. */
export const ConfirmAction: React.FC<ConfirmActionProps> = ({ texts, doneText, onConfirm }) => {
  const action = useConfirmAction(onConfirm);
  return (
    <div className="space-y-2">
      <p className="text-xs text-ink-3 leading-relaxed">{texts.hint}</p>
      {!action.open && <button type="button" onClick={action.ask} className={PILL_OUTLINE}>{texts.button}</button>}
      {action.open && (
        <div role="group" aria-label={texts.confirmTitle} className="rounded-2xl border border-tone-danger-line bg-tone-danger-bg p-4 space-y-3">
          <h4 className="text-sm font-bold text-tone-danger-ink">{texts.confirmTitle}</h4>
          <p className="text-sm text-ink-2 leading-relaxed">{texts.confirmBody}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={action.busy} onClick={() => void action.run()} className={PILL_DANGER}>{action.busy ? texts.working : texts.confirm}</button>
            <button type="button" disabled={action.busy} onClick={action.cancel} className={PILL_OUTLINE}>{texts.cancel}</button>
          </div>
        </div>
      )}
      {action.outcome === 'failed' && <p role="alert" className="text-sm text-tone-danger-ink">{texts.error}</p>}
      {action.outcome === 'done' && doneText && <p role="status" className="text-sm text-tone-success-ink">{doneText}</p>}
    </div>
  );
};
