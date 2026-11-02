import type { FlatPartId, FlatScenarioId } from '@/lib/engines/baikcare/flatRepair';

/** Where the name of a part is written (left, right or centred over the part) and the point of the part that its leader line touches. */
export interface LabelSpec {
  side: 'l' | 'r' | 'c';
  x?: number;
  y: number;
  tx: number;
  ty: number;
}

/** The names around the drawing of each job (the drawing is 360 by 240 units: the tyre stands in the middle, the names at both sides). */
export const LABELS: Record<FlatScenarioId, Partial<Record<FlatPartId, LabelSpec>>> = {
  tube: {
    tyre: { side: 'r', y: 56, tx: 247, ty: 112 },
    tube: { side: 'r', y: 130, tx: 222, ty: 128 },
    lever: { side: 'l', y: 84, tx: 100, ty: 96 },
    tape: { side: 'l', y: 178, tx: 146, ty: 185 },
    rim: { side: 'l', y: 214, tx: 125, ty: 205 },
    valve: { side: 'l', y: 234, tx: 177, ty: 228 },
  },
  patch: {
    tube: { side: 'l', y: 62, tx: 104, ty: 84 },
    hole: { side: 'r', y: 100, tx: 184, ty: 126 },
    rough: { side: 'l', y: 170, tx: 152, ty: 148 },
    patch: { side: 'r', y: 176, tx: 196, ty: 146 },
  },
  plug: {
    plug: { side: 'r', y: 36, tx: 184, ty: 44 },
    hole: { side: 'l', y: 56, tx: 175, ty: 61 },
    tyre: { side: 'r', y: 110, tx: 247, ty: 112 },
    sealant: { side: 'l', y: 130, tx: 120, ty: 130 },
    rim: { side: 'l', y: 214, tx: 125, ty: 205 },
  },
  sealant: {
    tyre: { side: 'r', y: 80, tx: 244, ty: 96 },
    sealant: { side: 'l', y: 130, tx: 120, ty: 130 },
    rim: { side: 'l', y: 206, tx: 125, ty: 205 },
    valve: { side: 'l', y: 234, tx: 177, ty: 228 },
    bottle: { side: 'c', x: 264, y: 236, tx: 264, ty: 222 },
  },
  tape: {
    tyre: { side: 'r', y: 80, tx: 244, ty: 96 },
    tape: { side: 'l', y: 176, tx: 146, ty: 185 },
    holes: { side: 'r', y: 208, tx: 202, ty: 189 },
    rim: { side: 'l', y: 214, tx: 125, ty: 205 },
  },
};
