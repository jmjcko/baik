import { INSEAM_LIMITS, computeBikeFitCoordinates, type BikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import type { FindingInput } from '@/components/report/reportFindings';
import type { RidingDiscipline } from '@/types/baikfit';

/** Saddle height target in mm for an inseam (LeMond, along the seat tube), as the report computes it. */
export const saddleTarget = (inseamMm: number) => Math.round(inseamMm * INSEAM_LIMITS.LEMOND_COEFFICIENT);

export interface ShowcaseRider {
  id: string;
  name: string;
  discipline: RidingDiscipline;
  input: FindingInput;
  coordinates: BikeFitCoordinates;
}

function rider(id: string, name: string, discipline: RidingDiscipline, input: Omit<FindingInput, 'saddleHeightMm'>): ShowcaseRider {
  return {
    id,
    name,
    discipline,
    input: { ...input, saddleHeightMm: saddleTarget(input.inseamMm) },
    coordinates: computeBikeFitCoordinates({ inseamMm: input.inseamMm, ridingDiscipline: discipline }),
  };
}

/** The Petr and Canyon scenario plus two contrasting riders for the target number cards. */
export const RIDERS: ShowcaseRider[] = [
  rider('petr', 'Petr: road, inseam 850, stock Canyon Endurace', 'road', {
    inseamMm: 850, acromionWidthMm: 380, crankLengthMm: 172.5, currentBarWidthMm: 420, currentSaddleHeightMm: 720,
  }),
  rider('short', 'Short rider: road, inseam 760, nothing entered', 'road', {
    inseamMm: 760, acromionWidthMm: 360, crankLengthMm: 165, currentBarWidthMm: null, currentSaddleHeightMm: null,
  }),
];

export const PETR = RIDERS[0];

/** Saddle states against the 751 mm target of the Petr scenario. */
export const SADDLE_STATES: Array<{ id: string; label: string; currentMm: number | null }> = [
  { id: 'tolerance', label: 'In tolerance (752 mm)', currentMm: 752 },
  { id: 'low', label: 'Too low (720 mm, raise by 31 mm)', currentMm: 720 },
  { id: 'high', label: 'Too high (766 mm, lower by 15 mm)', currentMm: 766 },
  { id: 'none', label: 'No data (current height not entered)', currentMm: null },
];

/** Handlebar states for a rider with 380 mm shoulders. */
export const BAR_STATES: Array<{ id: string; label: string; barMm: number }> = [
  { id: 'optimal', label: 'Optimal 1:1 (380 mm)', barMm: 380 },
  { id: 'trap', label: '420 mm factory trap', barMm: 420 },
];

export const CRANK_STATES: Array<{ id: string; label: string; crankMm: number }> = [
  { id: 'ok', label: 'Recommended (165 mm)', crankMm: 165 },
  { id: 'long', label: 'Stock 172.5 mm (knee 7.5 mm higher)', crankMm: 172.5 },
];

export function withInput(base: FindingInput, patch: Partial<FindingInput>): FindingInput {
  return { ...base, ...patch };
}
