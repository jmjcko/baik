import React from 'react';
import { BlueprintGrid, VIEW } from './blueprint';

interface SchematicFrameProps {
  testId: string;
  label: string;
  caption: string;
  /** Height of the drawing in SVG units (default: the standard 160). */
  height?: number;
  children: React.ReactNode;
}

/** Shared frame of the report schematics: accessible vector drawing plus a plain text caption. */
export const SchematicFrame: React.FC<SchematicFrameProps> = ({ testId, label, caption, height = VIEW.height, children }) => (
  <figure data-testid={testId} className="mb-4 w-full max-w-md rounded-lg border border-line bg-sunken p-3">
    <svg viewBox={`0 0 ${VIEW.width} ${height}`} role="img" aria-label={label} className="w-full max-w-sm mx-auto h-auto rounded-md overflow-hidden">
      <BlueprintGrid height={height} />
      {children}
    </svg>
    <figcaption className="mt-2 text-[11px] text-ink-2 leading-relaxed">{caption}</figcaption>
  </figure>
);
