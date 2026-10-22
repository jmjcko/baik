import React from 'react';

/** One labelled variation of a component in the showcase. */
export const Case: React.FC<{ label: string; note?: string; children: React.ReactNode }> = ({ label, note, children }) => (
  <figure className="space-y-2 min-w-0">
    <figcaption className="text-xs font-mono uppercase tracking-wide text-ink-3">
      {label}
      {note && <span className="block normal-case tracking-normal text-ink-3 mt-0.5">{note}</span>}
    </figcaption>
    {children}
  </figure>
);

export const SectionFrame: React.FC<{ id: string; title: string; hint: string; children: React.ReactNode }> = ({ id, title, hint, children }) => (
  <section id={id} data-testid={`showcase-${id}`} className="space-y-6">
    <header className="border-b border-line pb-3">
      <h2 className="text-2xl font-extrabold tracking-tight text-ink">{title}</h2>
      <p className="text-sm text-ink-2 mt-1">{hint}</p>
    </header>
    {children}
  </section>
);
