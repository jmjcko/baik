import type { WireframeGeometry } from '@/components/studio/wireframe/geometry';
import type { MCheckNodeId, WheelId } from '@/types/maintain';

export interface Point {
  x: number;
  y: number;
}

/** Where each node of the M-Check sits on the side view of the bike (SVG units of the studio drawing). */
export function nodePositions(g: WireframeGeometry): Record<MCheckNodeId, Point> {
  return {
    1: { x: g.frontAxleX, y: g.axleY },
    2: { x: g.barSvgX, y: g.barSvgY },
    3: { x: g.bbX, y: g.bbY },
    4: { x: g.saddleSvgX, y: g.saddleSvgY },
    5: { x: g.rearAxleX, y: g.axleY },
  };
}

/** Where the tyre point of each wheel sits: on the tyre at the outer upper side (the front wheel to the right, the rear wheel to the left), away from the frame and the nodes. */
export function tyrePositions(g: WireframeGeometry): Record<WheelId, Point> {
  const side = g.tireRadius * Math.SQRT1_2;
  return {
    front: { x: g.frontAxleX + side, y: g.axleY - side },
    rear: { x: g.rearAxleX - side, y: g.axleY - side },
  };
}

/** The part of the drawing that the hotspots are laid over. */
export const DRAWING_BOX = { x: 90, y: 40, width: 660, height: 440 } as const;

/** The position of a point inside the drawing in percent, for an HTML button laid over the SVG. */
export const percentOf = (point: Point): { left: string; top: string } => ({
  left: `${(((point.x - DRAWING_BOX.x) / DRAWING_BOX.width) * 100).toFixed(2)}%`,
  top: `${(((point.y - DRAWING_BOX.y) / DRAWING_BOX.height) * 100).toFixed(2)}%`,
});
