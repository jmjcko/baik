/** Diagnostic schematic colors: red and green carry the meaning (wrong and right), always paired with text labels. */
export const BAD = '#f43f5e';
export const GOOD = '#34d399';
export const LINE = '#cbd5e1';
export const MUTED = '#64748b';
export const MEASURE = '#00b4d8';

export interface Pt {
  x: number;
  y: number;
}

export const LABEL_FONT = { fontFamily: 'monospace', fontSize: 10, fontWeight: 'bold' } as const;
