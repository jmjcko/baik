import type { BikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';

/**
 * SVG coordinate system of the CAD wireframe: viewBox 800 x 480, 1 mm = 0.32 SVG units,
 * bottom bracket datum (0,0) at (370, 356).
 */
const SCALE = 0.32;
const BB_X = 370;
const BB_Y = 356;
/** Crank length of a standard road bike, used when no length is given. */
export const DEFAULT_CRANK_MM = 170;
const CRANK_ANGLE = (30 * Math.PI) / 180;
/** Rounded so that the server and the browser print the same coordinates (no hydration mismatch). */
const round2 = (value: number) => Math.round(value * 100) / 100;

export interface WireframeGeometry {
  bbX: number;
  bbY: number;
  axleY: number;
  rearAxleX: number;
  frontAxleX: number;
  wheelRadius: number;
  rimOuterRadius: number;
  rimInnerRadius: number;
  groundY: number;
  saddleSvgX: number;
  saddleSvgY: number;
  barSvgX: number;
  barSvgY: number;
  seatClusterX: number;
  seatClusterY: number;
  droppedStayX: number;
  droppedStayY: number;
  headtubeBottomX: number;
  headtubeBottomY: number;
  headtubeTopX: number;
  headtubeTopY: number;
  forkCrownX: number;
  forkCrownY: number;
  crankLengthMm: number;
  crankTipX: number;
  crankTipY: number;
}

type Frame = Pick<
  WireframeGeometry,
  | 'seatClusterX' | 'seatClusterY' | 'droppedStayX' | 'droppedStayY' | 'headtubeBottomX'
  | 'headtubeBottomY' | 'headtubeTopX' | 'headtubeTopY' | 'forkCrownX' | 'forkCrownY'
>;

/** Fixed frame geometry points (aero road / gravel frame), independent of the rider. */
function frameGeometry(): Frame {
  const headtubeBottomX = BB_X + 382 * SCALE;
  const headtubeBottomY = BB_Y - 370 * SCALE;
  return {
    seatClusterX: BB_X - 110 * SCALE,
    seatClusterY: BB_Y - 490 * SCALE,
    droppedStayX: BB_X - 74 * SCALE,
    droppedStayY: BB_Y - 330 * SCALE,
    headtubeBottomX,
    headtubeBottomY,
    headtubeTopX: BB_X + 344 * SCALE,
    headtubeTopY: BB_Y - 500 * SCALE,
    forkCrownX: headtubeBottomX,
    forkCrownY: headtubeBottomY,
  };
}

/** 50 mm deep carbon rim of the 700c wheel (bead seat 622 mm). */
function rimGeometry(): Pick<WireframeGeometry, 'rimOuterRadius' | 'rimInnerRadius'> {
  return { rimOuterRadius: 311 * SCALE, rimInnerRadius: 260 * SCALE };
}

/** Positions of every wireframe part, derived from the fit coordinates (BB datum at 0,0) and the crank length (drawn to scale). */
export function computeWireframeGeometry({ saddle, cockpit }: BikeFitCoordinates, crankLengthMm = DEFAULT_CRANK_MM): WireframeGeometry {
  const axleY = BB_Y - 70 * SCALE; // 70 mm bottom bracket drop
  const wheelRadius = 340 * SCALE; // 700x28c
  return {
    bbX: BB_X,
    bbY: BB_Y,
    axleY,
    rearAxleX: BB_X - 410 * SCALE,
    frontAxleX: BB_X + 595 * SCALE,
    wheelRadius,
    ...rimGeometry(),
    groundY: axleY + wheelRadius,
    saddleSvgX: BB_X + saddle.setbackXMm * SCALE,
    saddleSvgY: BB_Y - saddle.verticalYMm * SCALE,
    barSvgX: BB_X + cockpit.reachXMm * SCALE,
    barSvgY: BB_Y - cockpit.stackYMm * SCALE,
    ...frameGeometry(),
    crankLengthMm,
    crankTipX: round2(BB_X + crankLengthMm * SCALE * Math.cos(CRANK_ANGLE)),
    crankTipY: round2(BB_Y + crankLengthMm * SCALE * Math.sin(CRANK_ANGLE)),
  };
}
