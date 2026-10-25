import type { BikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import { mtbBase } from './mtbGeometry';

/**
 * SVG coordinate system of the CAD wireframe: viewBox 800 x 480, 1 mm = 0.32 SVG units,
 * bottom bracket datum (0,0) at (370, 356).
 */
export const SCALE = 0.32;
export const BB_X = 370;
export const BB_Y = 356;
/** Crank length of a standard road bike, used when no length is given. */
export const DEFAULT_CRANK_MM = 170;
const CRANK_ANGLE = (30 * Math.PI) / 180;
/** Rounded so that the server and the browser print the same coordinates (no hydration mismatch). */
export const round2 = (value: number) => Math.round(value * 100) / 100;

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
  /** The drawing of a road/gravel bike or of a mountain bike (suspension fork, flat bar, big tyres). */
  kind: WireframeKind;
  /** Centre radius and width of the tyre ring. */
  tireRadius: number;
  tireStroke: number;
  chainringRadius: number;
  cassetteRadius: number;
  /** Mountain bike fork: the angle of the steering axis from the horizontal (radians), the axle to crown length and the offset, in SVG units. */
  forkAngleRad: number;
  forkLength: number;
  forkOffset: number;
}

export type WireframeKind = 'road' | 'mtb';

/** The parts of the geometry that differ between the road and the mountain bike drawing. */
export type BikeBase = Pick<
  WireframeGeometry,
  | 'axleY' | 'rearAxleX' | 'frontAxleX' | 'wheelRadius' | 'rimOuterRadius' | 'rimInnerRadius' | 'groundY' | 'tireRadius' | 'tireStroke'
  | 'chainringRadius' | 'cassetteRadius' | 'forkAngleRad' | 'forkLength' | 'forkOffset'
> & Frame

export type Frame = Pick<
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

/** Road bike: 700c wheels, a fixed aero frame and a bladed fork. */
function roadBase(): BikeBase {
  const axleY = BB_Y - 70 * SCALE; // 70 mm bottom bracket drop
  const wheelRadius = 340 * SCALE; // 700x28c
  return {
    axleY,
    rearAxleX: BB_X - 410 * SCALE,
    frontAxleX: BB_X + 595 * SCALE,
    wheelRadius,
    ...rimGeometry(),
    groundY: axleY + wheelRadius,
    tireRadius: wheelRadius,
    tireStroke: 7,
    chainringRadius: 25,
    cassetteRadius: 14,
    forkAngleRad: 0,
    forkLength: 0,
    forkOffset: 0,
    ...frameGeometry(),
  };
}

/** Positions of every wireframe part, derived from the fit coordinates (BB datum at 0,0) and the crank length (drawn to scale). */
export function computeWireframeGeometry({ saddle, cockpit }: BikeFitCoordinates, crankLengthMm = DEFAULT_CRANK_MM, kind: WireframeKind = 'road'): WireframeGeometry {
  return {
    bbX: BB_X,
    bbY: BB_Y,
    saddleSvgX: BB_X + saddle.setbackXMm * SCALE,
    saddleSvgY: BB_Y - saddle.verticalYMm * SCALE,
    barSvgX: BB_X + cockpit.reachXMm * SCALE,
    barSvgY: BB_Y - cockpit.stackYMm * SCALE,
    ...(kind === 'mtb' ? mtbBase() : roadBase()),
    kind,
    crankLengthMm,
    crankTipX: round2(BB_X + crankLengthMm * SCALE * Math.cos(CRANK_ANGLE)),
    crankTipY: round2(BB_Y + crankLengthMm * SCALE * Math.sin(CRANK_ANGLE)),
  };
}
