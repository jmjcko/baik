import React from 'react';

interface SchematicFrameProps {
  testId: string;
  label: string;
  caption: string;
  children: React.ReactNode;
}

/** Shared frame of the report schematics: accessible vector drawing plus a plain text caption. */
export const SchematicFrame: React.FC<SchematicFrameProps> = ({ testId, label, caption, children }) => (
  <figure data-testid={testId} className="mb-4 rounded-lg border border-slate-700 bg-slate-950/50 p-3">
    <svg viewBox="0 0 260 160" role="img" aria-label={label} className="w-full max-w-sm mx-auto h-auto">
      {children}
    </svg>
    <figcaption className="mt-2 text-[11px] text-slate-300 leading-relaxed">{caption}</figcaption>
  </figure>
);
