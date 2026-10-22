/**
 * bAIkfit Engine - Biomechanical XY Coordinate System
 * 
 * Establishes the universal Cartesian coordinate system for bike fitting.
 * Datum origin (0,0) is defined as the Center of the Bottom Bracket (BB) Shell.
 * Saddle height uses the LeMond coefficient (0.883 * Inseam) measured along the seat tube to
 * the 70mm width datum point on the saddle top surface; Saddle Y is its vertical projection (KB 1.1).
 */

import { ESTIMATES } from './estimates';
import { KB_RULES } from './kbRules';
import type {
  BikeFitCoordinates,
  RidingDiscipline,
  SavedRiderProfile,
} from '@/types/baikfit';

export type { BikeFitCoordinates, SavedRiderProfile };

export interface RiderInseamInput {
  inseamMm: number;
  ridingDiscipline?: RidingDiscipline;
}

export const INSEAM_LIMITS = {
  MIN_MM: 500,
  MAX_MM: 1100,
  DEFAULT_MM: 840,
  LEMOND_COEFFICIENT: KB_RULES.lemondCoefficient, // KB 2.1
};

/**
 * Validates whether the inseam value falls within safe human anthropometric bounds.
 */
export function validateInseam(inseamMm: number): { isValid: boolean; errorKey?: string } {
  if (typeof inseamMm !== 'number' || isNaN(inseamMm)) {
    return { isValid: false, errorKey: 'invalidNumber' };
  }
  if (inseamMm < INSEAM_LIMITS.MIN_MM || inseamMm > INSEAM_LIMITS.MAX_MM) {
    return { isValid: false, errorKey: 'outOfRange' };
  }
  return { isValid: true };
}

/**
 * Calculates saddle height Y from BB origin (0,0) to the 70mm width mark on the saddle.
 * Formula: Inseam (mm) * 0.883
 */
export function calculateSaddleHeight(inseamMm: number): number {
  const validation = validateInseam(inseamMm);
  if (!validation.isValid) {
    throw new Error(`Inseam ${inseamMm}mm is invalid or out of range [${INSEAM_LIMITS.MIN_MM}-${INSEAM_LIMITS.MAX_MM}].`);
  }
  return Math.round(inseamMm * INSEAM_LIMITS.LEMOND_COEFFICIENT);
}

/**
 * Computes full XY coordinates relative to BB (0,0).
 * Saddle height is defined by the KB (LeMond, KB 2.1); setback, stack and reach are estimates
 * (see ./estimates.ts) until KB v1.2.0 defines them.
 */
export function computeBikeFitCoordinates(input: RiderInseamInput): BikeFitCoordinates {
  const saddleY = calculateSaddleHeight(input.inseamMm);
  const ratios = ESTIMATES.cockpitRatiosByDiscipline.value[input.ridingDiscipline ?? 'road'];

  return {
    datum: [0, 0],
    saddle: {
      heightAlongTubeMm: saddleY,
      verticalYMm: Math.round(saddleY * Math.sin((ESTIMATES.seatTubeAngleDeg.value * Math.PI) / 180)),
      setbackXMm: -Math.round(input.inseamMm * ratios.setback),
      measurementPointNote: '70mm width mark on top surface of saddle',
    },
    cockpit: {
      reachXMm: Math.round(input.inseamMm * ratios.reach),
      stackYMm: Math.round(input.inseamMm * ratios.stack),
    },
  };
}

/**
 * LocalStorage Key for Rider Profile Persistence
 */
export const RIDER_PROFILE_STORAGE_KEY = 'baiktime_rider_profile';

/**
 * Saves calculated fit coordinates to browser LocalStorage.
 */
export function saveCoordinatesToStorage(profile: SavedRiderProfile): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }
  try {
    window.localStorage.setItem(RIDER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
    return true;
  } catch {
    return false;
  }
}

/**
 * Loads the persisted rider profile from browser LocalStorage.
 * Tolerates profiles saved by earlier versions (inseam + discipline only):
 * missing fields are simply absent from the result.
 */
export function loadCoordinatesFromStorage(): Partial<SavedRiderProfile> | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(RIDER_PROFILE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as Partial<SavedRiderProfile>) : null;
  } catch {
    return null;
  }
}
