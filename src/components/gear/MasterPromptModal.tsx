'use client';

import React, { useMemo, useState } from 'react';
import { Check, Copy, X } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { copyText } from '@/lib/clipboard';
import { useEscape } from '@/lib/hooks/useEscape';
import { buildMasterPrompt, type LukeInput } from '@/lib/agents/lukeCykloAgent';

interface ModalProps {
  t: Translations;
  /** Everything the prompt can carry; the toggles of the dialog decide what it does. */
  input: Omit<LukeInput, 'include'>;
  onClose: () => void;
}

const Toggle: React.FC<{ label: string; checked: boolean; testId: string; onChange: (value: boolean) => void }> = ({ label, checked, testId, onChange }) => (
  <label className="flex items-center gap-3 text-sm text-ink">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} data-testid={testId} className="h-4 w-4 accent-blue-600" />
    {label}
  </label>
);

const Header: React.FC<{ t: Translations; onClose: () => void }> = ({ t, onClose }) => (
  <div className="flex items-start justify-between gap-4">
    <div>
      <h2 id="prompt-title" className="text-lg font-bold text-ink tracking-tight">{t.gear.modal.title}</h2>
      <p className="text-sm text-ink-2 mt-1">{t.gear.modal.intro}</p>
    </div>
    <button type="button" onClick={onClose} aria-label={t.gear.modal.close} className="h-10 w-10 shrink-0 rounded-full border border-line bg-surface text-ink-2 hover:bg-sunken inline-flex items-center justify-center"><X aria-hidden="true" className="w-4 h-4" /></button>
  </div>
);

/** The button that copies the text and says whether it worked. */
const CopyBar: React.FC<{ t: Translations; text: string }> = ({ t, text }) => {
  const m = t.gear.modal;
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const copy = async () => setState((await copyText(text)) ? 'copied' : 'failed');
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" onClick={copy} data-testid="prompt-copy" className="h-12 px-6 rounded-full bg-blue-600 text-slate-50 text-sm font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2">
        {state === 'copied' ? <Check aria-hidden="true" className="w-4 h-4" /> : <Copy aria-hidden="true" className="w-4 h-4" />}
        {state === 'copied' ? m.copied : m.copy}
      </button>
      {state === 'failed' && <p role="alert" className="text-sm font-semibold text-tone-danger-ink" data-testid="prompt-failed">{m.failed}</p>}
    </div>
  );
};

/** The master prompt of Luke with the two switches of what it may carry, a preview and a button that copies it. */
export const MasterPromptModal: React.FC<ModalProps> = ({ t, input, onClose }) => {
  const m = t.gear.modal;
  const [rider, setRider] = useState(true);
  const [bike, setBike] = useState(true);
  const text = useMemo(() => buildMasterPrompt(t, { ...input, include: { rider, bike } }), [t, input, rider, bike]);
  useEscape(onClose);
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="prompt-title" data-testid="prompt-dialog" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-line bg-surface p-6 shadow-xl space-y-4">
        <Header t={t} onClose={onClose} />
        <div className="space-y-2">
          <Toggle label={m.includeBike} checked={bike} testId="include-bike" onChange={setBike} />
          <Toggle label={m.includeRider} checked={rider} testId="include-rider" onChange={setRider} />
          <p className="text-xs text-ink-3">{m.privacy}</p>
        </div>
        <label className="block space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-3">{m.preview}</span>
          <textarea readOnly value={text} rows={14} data-testid="prompt-preview" className="w-full rounded-xl border border-line bg-sunken p-3 text-xs font-mono text-ink leading-relaxed" />
        </label>
        <p className="text-xs font-mono text-ink-3" data-testid="prompt-size">{fill(m.size, { n: text.length })}</p>
        <CopyBar t={t} text={text} />
      </div>
    </div>
  );
};
