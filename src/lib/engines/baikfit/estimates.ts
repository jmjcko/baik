/**
 * Values that docs/knowledge/baikfit_kb.md does NOT define.
 * They are estimates, isolated here so they are visible, marked in the UI and replaced by KB rules
 * once the knowledge base defines them (KB v1.2.0: stack/reach delta matrix and setback calculation).
 * Every entry must reference docs/knowledge/kb_backlog.md (enforced by a test).
 */
import type { RidingDiscipline, RidingStyle } from '@/types/baikfit';

export interface Estimate<T> {
  value: T;
  reason: string;
  backlogRef: string;
}

const BACKLOG_REF = 'docs/knowledge/kb_backlog.md#5';

function estimate<T>(value: T, reason: string): Estimate<T> {
  return { value, reason, backlogRef: BACKLOG_REF };
}

interface CockpitRatios {
  setback: number;
  stack: number;
  reach: number;
}

export interface StockFrameEstimate {
  size: string;
  stackMm: number;
  reachMm: number;
  barWidthMm: number;
  crankMm: number;
}

export const ESTIMATES = {
  cockpitRatiosByDiscipline: estimate<Record<RidingDiscipline, CockpitRatios>>(
    {
      road: { setback: 0.25, stack: 0.675, reach: 0.457 },
      gravel: { setback: 0.25, stack: 0.69, reach: 0.445 },
      xc_mtb: { setback: 0.22, stack: 0.71, reach: 0.47 },
      trekking: { setback: 0.24, stack: 0.72, reach: 0.43 },
    },
    'KB 1.1 defines the datum but gives no formula for setback, stack or reach; ratios of the inseam are heuristics (trekking values set by the product owner on 2026-10-22).'
  ),
  seatTubeAngleDeg: estimate(
    73.5,
    'KB 1.1 defines Saddle Y as a vertical projection but gives no seat tube angle; 73.5 degrees is a typical road value.'
  ),
  heavyRiderKg: estimate(
    90,
    'KB 5 names higher body mass as a crank trigger without a number; the product owner set it to above 90 kg on 2026-10-22 until KB v1.2.0.'
  ),
  tallRiderCm: estimate(
    188,
    'KB 5 gives no height trigger for crank length; the product owner set it to above 188 cm on 2026-10-22 until KB v1.2.0.'
  ),
  fitStackPerInseam: estimate(0.69, 'Recommended stack for the pre-purchase audit is a heuristic (inseam factor).'),
  fitStackOffsetByStyle: estimate<Record<RidingStyle, number>>(
    { endurance: 35, balanced: 20, race: 5 },
    'Style offsets for the recommended stack are heuristics.'
  ),
  fitReachFactors: estimate(
    { torso: 0.46, arm: 0.15, raceOffsetMm: 20 },
    'Recommended reach from torso and arm length is a heuristic.'
  ),
  stockFrameTable: estimate(
    {
      thresholdsCm: { xs: 168, s: 176, l: 185 },
      xs: { size: 'XS / 49cm', stackMm: 525, reachMm: 365, barWidthMm: 400, crankMm: 165 },
      s: { size: 'S / 52cm', stackMm: 545, reachMm: 375, barWidthMm: 400, crankMm: 170 },
      m: { size: 'M / 54cm', stackMm: 565, reachMm: 380, barWidthMm: 420, crankMm: 172.5 },
      l: { size: 'L / 56cm', stackMm: 585, reachMm: 390, barWidthMm: 440, crankMm: 175 },
    } as {
      thresholdsCm: { xs: number; s: number; l: number };
      xs: StockFrameEstimate;
      s: StockFrameEstimate;
      m: StockFrameEstimate;
      l: StockFrameEstimate;
    },
    'Typical stock frame and component sizes by rider height are assumed when the real bike data is unknown.'
  ),
} as const;
