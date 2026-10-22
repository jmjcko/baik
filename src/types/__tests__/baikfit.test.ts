import { describe, it, expect } from 'vitest';
import {
  BAIKFIT_DOMAIN_TRANSLATIONS,
  RiderProfile,
  BikeFitCoordinates,
  PrePurchaseAnalysisResponse,
} from '../baikfit';
import {
  mockRiderProfileEndurance,
  mockRiderProfileRace,
  mockRiderProfileHeavy,
  mockBikeFitCoordinates,
  mockPrePurchaseRequest,
  mockPrePurchaseResponse,
} from './baikfit.mock';

describe('bAIkfit TypeScript Interfaces & Contracts', () => {
  describe('RiderProfile & Measurements Interface', () => {
    it('should validate typical endurance profile structure', () => {
      const profile: RiderProfile = mockRiderProfileEndurance;
      expect(profile.inseamMm).toBe(840);
      expect(profile.heightCm).toBe(180);
      expect(profile.torsoLengthMm).toBe(620);
      expect(profile.armLengthMm).toBe(640);
      expect(profile.acromionWidthMm).toBe(390);
      expect(profile.riderWeightKg).toBe(78);
      expect(profile.flexibilityScore).toBe('moderate');
      expect(profile.ridingStyle).toBe('endurance');
      expect(profile.currentPains).toContain('numb_hands');
    });

    it('should validate race and heavy rider mock variants', () => {
      expect(mockRiderProfileRace.ridingStyle).toBe('race');
      expect(mockRiderProfileRace.flexibilityScore).toBe('flexible');
      expect(mockRiderProfileHeavy.riderWeightKg).toBe(96);
      expect(mockRiderProfileHeavy.currentPains).toContain('front_knee');
    });
  });

  describe('BikeFitCoordinates (XY Datum System)', () => {
    it('should strictly enforce Bottom Bracket datum at (0,0)', () => {
      const coords: BikeFitCoordinates = mockBikeFitCoordinates;
      expect(coords.datum).toEqual([0, 0]);
    });

    it('should reference saddle height at the 70mm width mark', () => {
      expect(mockBikeFitCoordinates.saddle.measurementPointNote).toContain('70mm');
      expect(mockBikeFitCoordinates.saddle.heightAlongTubeMm).toBeGreaterThan(500);
      expect(mockBikeFitCoordinates.saddle.setbackXMm).toBeLessThanOrEqual(0);
    });

    it('should include cockpit reach and stack', () => {
      expect(mockBikeFitCoordinates.cockpit.reachXMm).toBe(384);
      expect(mockBikeFitCoordinates.cockpit.stackYMm).toBe(567);
    });
  });

  describe('PrePurchaseAnalysis Gemini Contracts', () => {
    it('should correctly structure pre-purchase request', () => {
      expect(mockPrePurchaseRequest.bikeModelName).toBe('Canyon Endurace CF 7 Disc');
      expect(mockPrePurchaseRequest.shopUrl).toContain('canyon.com');
      expect(mockPrePurchaseRequest.riderProfile).toBeDefined();
    });

    it('should validate complete pre-purchase response with stack, reach and component alerts', () => {
      const response: PrePurchaseAnalysisResponse = mockPrePurchaseResponse;
      expect(response.fitMatchScore).toBeGreaterThanOrEqual(0);
      expect(response.fitMatchScore).toBeLessThanOrEqual(100);
      expect(response.recommendedFrameSize).toBe('M (Medium)');
      expect(response.stackMatch.spacerDeltaMm).toBe(17);
      expect(response.reachMatch.stemDeltaMm).toBe(0);
      expect(response.componentMismatchAlerts.length).toBeGreaterThan(0);
    });

    it('should guarantee 100% bilingual parity across all component mismatch alerts', () => {
      mockPrePurchaseResponse.componentMismatchAlerts.forEach((alert) => {
        expect(alert.component).toMatch(/handlebar|crank|saddle|stem/);
        expect(alert.stockSpec.length).toBeGreaterThan(0);
        expect(alert.recommendedSpec.length).toBeGreaterThan(0);
        expect(alert.reasoningEn.length).toBeGreaterThan(15);
        expect(alert.reasoningCs.length).toBeGreaterThan(15);
        expect(alert.financialSavingsNoteEn.length).toBeGreaterThan(15);
        expect(alert.financialSavingsNoteCs.length).toBeGreaterThan(15);
      });
      expect(mockPrePurchaseResponse.overallSummaryEn.length).toBeGreaterThan(20);
      expect(mockPrePurchaseResponse.overallSummaryCs.length).toBeGreaterThan(20);
    });
  });

  describe('Bilingual Domain Label Dictionaries', () => {
    it('should provide full EN and CS translations for all flexibility scores', () => {
      const scores = ['inflexible', 'moderate', 'flexible'] as const;
      scores.forEach((score) => {
        const trans = BAIKFIT_DOMAIN_TRANSLATIONS.flexibility[score];
        expect(trans.en).toBeDefined();
        expect(trans.cs).toBeDefined();
        expect(trans.en.length).toBeGreaterThan(3);
        expect(trans.cs.length).toBeGreaterThan(3);
      });
    });

    it('should provide full EN and CS translations for all riding styles', () => {
      const styles = ['endurance', 'balanced', 'race'] as const;
      styles.forEach((style) => {
        const trans = BAIKFIT_DOMAIN_TRANSLATIONS.ridingStyle[style];
        expect(trans.en).toBeDefined();
        expect(trans.cs).toBeDefined();
      });
    });

    it('should provide full EN and CS translations for all rider pain symptoms', () => {
      const pains = [
        'numb_hands',
        'front_knee',
        'back_knee',
        'lower_back',
        'saddle_sores',
      ] as const;
      pains.forEach((pain) => {
        const trans = BAIKFIT_DOMAIN_TRANSLATIONS.pains[pain];
        expect(trans.en).toBeDefined();
        expect(trans.cs).toBeDefined();
      });
    });

    it('should provide full EN and CS translations for all mismatch component types', () => {
      const components = ['handlebar', 'crank', 'saddle', 'stem'] as const;
      components.forEach((comp) => {
        const trans = BAIKFIT_DOMAIN_TRANSLATIONS.components[comp];
        expect(trans.en).toBeDefined();
        expect(trans.cs).toBeDefined();
      });
    });
  });
});
