/** Diagnostic schematic colors from the theme tokens: red and green carry the meaning (wrong and right), always paired with text labels. */
export const BAD = 'var(--schematic-bad)';
export const GOOD = 'var(--schematic-good)';
export const LINE = 'var(--schematic-line)';
export const MUTED = 'var(--schematic-muted)';
export const MEASURE = 'var(--schematic-measure)';
export const GRID = 'var(--schematic-grid)';
export const GRID_MAJOR = 'var(--schematic-grid-major)';
export const PILL = 'var(--schematic-pill)';
export const BODY = 'var(--schematic-body)';

export interface Pt {
  x: number;
  y: number;
}

export const LABEL_FONT = { fontFamily: 'monospace', fontSize: 10, fontWeight: 'bold' } as const;
