import { BB_X, BB_Y, SCALE, round2, type BikeBase } from './geometry';

/** A modern 29er: 66 degree head angle, a 100 mm head tube, 435 mm chainstays, a bottom bracket 38 mm below the axles. */
const HEAD_ANGLE_RAD = (66 * Math.PI) / 180;
const HEAD_TUBE_MM = 100;
const FORK_OFFSET_MM = 44;
const BB_DROP_MM = 38;
const CHAINSTAY_MM = 435;
const TIRE_OUTER_RADIUS_MM = 372;
const RIM_BEAD_RADIUS_MM = 311;
const TIRE_WIDTH_MM = 56;

const TOP = { x: 345, y: 560 };

/** Head tube and fork in mm from the bottom bracket: the axle sits BB_DROP_MM above the bottom bracket, which fixes the length of the fork. */
function headAndFork() {
  const bottomX = TOP.x + HEAD_TUBE_MM * Math.cos(HEAD_ANGLE_RAD);
  const bottomY = TOP.y - HEAD_TUBE_MM * Math.sin(HEAD_ANGLE_RAD);
  const forkMm = (bottomY + FORK_OFFSET_MM * Math.cos(HEAD_ANGLE_RAD) - BB_DROP_MM) / Math.sin(HEAD_ANGLE_RAD);
  const frontAxleMm = bottomX + forkMm * Math.cos(HEAD_ANGLE_RAD) + FORK_OFFSET_MM * Math.sin(HEAD_ANGLE_RAD);
  return { bottomX, bottomY, forkMm, frontAxleMm };
}

/** 29 inch wheels with a wide tyre on the 622 mm rim, a short chainring and a large cassette. */
function wheels(frontAxleMm: number): Pick<BikeBase, 'axleY' | 'rearAxleX' | 'frontAxleX' | 'wheelRadius' | 'rimOuterRadius' | 'rimInnerRadius' | 'groundY' | 'tireRadius' | 'tireStroke' | 'chainringRadius' | 'cassetteRadius'> {
  const axleY = BB_Y - BB_DROP_MM * SCALE;
  const wheelRadius = TIRE_OUTER_RADIUS_MM * SCALE;
  const tireStroke = TIRE_WIDTH_MM * SCALE;
  return {
    axleY,
    rearAxleX: BB_X - Math.sqrt(CHAINSTAY_MM ** 2 - BB_DROP_MM ** 2) * SCALE,
    frontAxleX: round2(BB_X + frontAxleMm * SCALE),
    wheelRadius,
    rimOuterRadius: RIM_BEAD_RADIUS_MM * SCALE,
    rimInnerRadius: (RIM_BEAD_RADIUS_MM - 28) * SCALE,
    groundY: axleY + wheelRadius,
    tireRadius: wheelRadius - tireStroke / 2,
    tireStroke,
    chainringRadius: 17,
    cassetteRadius: 19,
  };
}

/** Mountain bike (suspension fork, 29 inch wheels): the frame is fixed like the road one; the fork reaches the axle from the head tube. */
export function mtbBase(): BikeBase {
  const { bottomX, bottomY, forkMm, frontAxleMm } = headAndFork();
  return {
    ...wheels(frontAxleMm),
    forkAngleRad: HEAD_ANGLE_RAD,
    forkLength: forkMm * SCALE,
    forkOffset: FORK_OFFSET_MM * SCALE,
    seatClusterX: BB_X - 105 * SCALE,
    seatClusterY: BB_Y - 410 * SCALE,
    droppedStayX: BB_X - 100 * SCALE,
    droppedStayY: BB_Y - 380 * SCALE,
    headtubeBottomX: round2(BB_X + bottomX * SCALE),
    headtubeBottomY: round2(BB_Y - bottomY * SCALE),
    headtubeTopX: BB_X + TOP.x * SCALE,
    headtubeTopY: BB_Y - TOP.y * SCALE,
    forkCrownX: round2(BB_X + bottomX * SCALE),
    forkCrownY: round2(BB_Y - bottomY * SCALE),
  };
}
