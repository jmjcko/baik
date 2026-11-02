import React from 'react';

/** A rider as a plain line drawing: a circle for the head and a half circle for the body. Decoration only, the name is always written next to it. */
export const RiderFigure: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 40 40" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className={className}>
    <circle cx="20" cy="13" r="7.5" />
    <path d="M6 37 A14 14 0 0 1 34 37" />
  </svg>
);
