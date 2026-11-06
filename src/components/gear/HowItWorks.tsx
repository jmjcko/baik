import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';

/** The short explanation at the start: what bAIkgear is, the three things that happen, that it sells nothing, and a peek at the prompt. */
/** The three steps, the note that nothing is sold and the peek at the prompt. */
const HowBody: React.FC<{ t: Translations }> = ({ t }) => {
  const h = t.gear.howItWorks;
  const [open, setOpen] = useState(false);
  return (
    <div id="how-body" className="space-y-4">
      <ol className="grid gap-3 md:grid-cols-3">
        {h.items.map((item, index) => (
          <li key={item.title} className="rounded-xl bg-sunken border border-field-line p-4 flex gap-3">
            <span aria-hidden="true" className="h-7 w-7 shrink-0 rounded-full bg-blue-600 text-slate-50 text-xs font-bold inline-flex items-center justify-center">{index + 1}</span>
            <span><span className="block text-sm font-bold text-ink">{item.title}</span><span className="block text-xs text-ink-2 leading-relaxed mt-1">{item.body}</span></span>
          </li>
        ))}
      </ol>
      <p className="text-xs text-ink-2">{h.notShop}</p>
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} data-testid="example-toggle" className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-ink">
        {open ? h.exampleHide : h.exampleShow}
        <ChevronDown aria-hidden="true" className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <pre className="rounded-xl bg-sunken border border-field-line p-4 text-xs font-mono text-ink whitespace-pre-wrap" data-testid="example-prompt">{h.example.join('\n')}</pre>}
    </div>
  );
};

/** The explanation at the start, folded away until the rider asks for it so that the field of the product comes first. */
export const HowItWorks: React.FC<{ t: Translations }> = ({ t }) => {
  const h = t.gear.howItWorks;
  const [shown, setShown] = useState(false);
  return (
    <section className="rounded-2xl border border-tone-info-line bg-tone-info-bg p-4 space-y-4" data-testid="how-it-works" aria-labelledby="how-title">
      <button type="button" aria-expanded={shown} aria-controls="how-body" onClick={() => setShown(!shown)} data-testid="how-toggle" className="w-full flex items-center justify-between gap-3 text-left">
        <span>
          <span id="how-title" className="block text-base font-bold text-ink">{h.title}</span>
          <span className="block text-sm text-ink mt-0.5">{h.intro}</span>
        </span>
        <ChevronDown aria-hidden="true" className={`w-5 h-5 shrink-0 text-accent-ink transition-transform ${shown ? 'rotate-180' : ''}`} />
      </button>
      {shown && <HowBody t={t} />}
    </section>
  );
};
