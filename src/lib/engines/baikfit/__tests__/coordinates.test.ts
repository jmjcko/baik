import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  calculateSaddleHeight,
  computeBikeFitCoordinates,
  validateInseam,
  saveCoordinatesToStorage,
  loadCoordinatesFromStorage,
  RIDER_PROFILE_STORAGE_KEY,
} from '../coordinates';

describe('bAIkfit Engine - Biomechanical Coordinates (Story 1.1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('AC 1.1.1: Datum Point Origin', () => {
    it('should explicitly define the Bottom Bracket shell center as datum [0, 0]', () => {
      const result = computeBikeFitCoordinates({ inseamMm: 840 });
      expect(result.datum).toEqual([0, 0]);
    });
  });

  describe('AC 1.1.2: LeMond Saddle Height Formula', () => {
    it('should calculate saddle height Y as Inseam * 0.883 rounded to the nearest integer', () => {
      // 840 * 0.883 = 741.72 -> 742
      const saddleHeight = calculateSaddleHeight(840);
      expect(saddleHeight).toBe(742);

      // 780 * 0.883 = 688.74 -> 689
      expect(calculateSaddleHeight(780)).toBe(689);

      // 900 * 0.883 = 794.7 -> 795
      expect(calculateSaddleHeight(900)).toBe(795);
    });

    it('should throw an error if inseam is outside anthropometric limits', () => {
      expect(() => calculateSaddleHeight(450)).toThrowError(/out of range/i);
      expect(() => calculateSaddleHeight(1200)).toThrowError(/out of range/i);
    });
  });

  describe('AC 1.1.3: 70mm Datum Specification', () => {
    it('should include the 70mm saddle top surface width mark specification note', () => {
      const result = computeBikeFitCoordinates({ inseamMm: 840 });
      expect(result.saddle.measurementPointNote).toContain('70mm width mark');
      expect(result.saddle.heightAlongTubeMm).toBe(742);
      expect(result.saddle.verticalYMm).toBe(711); // 742 x sin(73.5 deg)
      expect(result.saddle.setbackXMm).toBeLessThan(0); // Setback is behind BB (negative X)
    });
  });

  describe('AC 8.3.2: trekking and urban discipline (provisional estimates)', () => {
    it('should use setback 0.24, stack 0.72 and reach 0.43 of the inseam', () => {
      const result = computeBikeFitCoordinates({ inseamMm: 840, ridingDiscipline: 'trekking' });
      expect(result.saddle.setbackXMm).toBe(-202);
      expect(result.cockpit.stackYMm).toBe(605);
      expect(result.cockpit.reachXMm).toBe(361);
    });
  });

  describe('AC 1.1.4: Input Validation Bounds', () => {
    it('should validate inputs within [500mm, 1100mm]', () => {
      expect(validateInseam(500).isValid).toBe(true);
      expect(validateInseam(1100).isValid).toBe(true);
      expect(validateInseam(840).isValid).toBe(true);

      expect(validateInseam(499).isValid).toBe(false);
      expect(validateInseam(1101).isValid).toBe(false);
      expect(validateInseam(NaN).isValid).toBe(false);
    });
  });

  describe('AC 1.1.5: Persistence to LocalStorage', () => {
    it('should persist and retrieve rider coordinates to/from LocalStorage', () => {
      const coords = computeBikeFitCoordinates({ inseamMm: 840, ridingDiscipline: 'road' });
      const profile = {
        savedAt: new Date().toISOString(),
        inseamMm: 840,
        torsoLengthMm: 620,
        armLengthMm: 620,
        acromionWidthMm: 420,
        heightCm: 178,
        crankLengthMm: 170,
        riderWeightKg: 75,
        currentSaddleHeightMm: null,
        currentBarWidthMm: null,
        discipline: 'road' as const,
        ridingStyle: 'balanced' as const,
        currentPains: ['numb_hands' as const],
        coordinates: coords,
      };

      const saved = saveCoordinatesToStorage(profile);
      expect(saved).toBe(true);

      const raw = localStorage.getItem(RIDER_PROFILE_STORAGE_KEY);
      expect(raw).toBeTruthy();

      const loaded = loadCoordinatesFromStorage();
      expect(loaded).not.toBeNull();
      expect(loaded?.inseamMm).toBe(840);
      expect(loaded?.acromionWidthMm).toBe(420);
      expect(loaded?.currentPains).toEqual(['numb_hands']);
      expect(loaded?.coordinates?.saddle.heightAlongTubeMm).toBe(742);
      expect(loaded?.coordinates?.datum).toEqual([0, 0]);
    });

    it('should load a legacy profile that only holds inseam and discipline', () => {
      localStorage.setItem(
        RIDER_PROFILE_STORAGE_KEY,
        JSON.stringify({ inseamMm: 800, discipline: 'gravel' })
      );
      const loaded = loadCoordinatesFromStorage();
      expect(loaded?.inseamMm).toBe(800);
      expect(loaded?.acromionWidthMm).toBeUndefined();
    });
  });
});
