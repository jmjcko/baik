import React from 'react';

interface FigureFrameProps {
  testId: string;
  label: string;
  caption: string;
  /** SVG viewBox in the pixel coordinates of the 1024 x 1024 guide image. */
  viewBox: string;
  children: React.ReactNode;
}

/**
 * Frame for schematics drawn on a guide figure (the same anatomical line art as the measurement guides):
 * a white panel in both themes, because the artwork has a white background, with the caption in theme colors below it.
 */
export const FigureFrame: React.FC<FigureFrameProps> = ({ testId, label, caption, viewBox, children }) => (
  <figure data-testid={testId} className="mb-4 w-full max-w-xs">
    <div className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
      <svg viewBox={viewBox} role="img" aria-label={label} className="w-full h-auto block" xmlns="http://www.w3.org/2000/svg">
        {children}
      </svg>
    </div>
    <figcaption className="mt-2 text-[11px] text-ink-2 leading-relaxed">{caption}</figcaption>
  </figure>
);
