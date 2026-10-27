import type { PrePurchaseAnalysisRequest, PrePurchaseAnalysisResponse, RiderProfile } from '@/types/baikfit';
import { applyBiomechanicalRules } from './biomechanicalRules';
import { buildAlternatives, buildCons, buildPros } from './deterministicContent';
import { buildChecklist, buildTraps } from './deterministicTraps';
import { bestFrameOf } from './geometryFrame';
import { isMtbAudit } from './mtbPrePurchase';
import { computeFitTargets, type FitTargets, type StockFrame } from './stockFrame';

function summaryFor(
  bikeModelName: string,
  size: string,
  score: number,
  spacerMm: number,
  hasAlerts: boolean
): { en: string; cs: string } {
  const enTail = hasAlerts
    ? ' Pay close attention to the component swap recommendations before delivery.'
    : ' Factory cockpit components are well-aligned.';
  const csTail = hasAlerts
    ? ' Před expedicí důrazně doporučujeme vyřešit doporučené výměny sériových komponent.'
    : ' Sériové osazení kokpitu je v souladu s vašimi parametry.';
  return {
    en: `The ${bikeModelName} in size ${size} matches your morphology with a ${score}% fit score. With ${spacerMm}mm of spacers under the stem, target stack can be achieved comfortably.${enTail}`,
    cs: `Kolo ${bikeModelName} ve velikosti ${size} odpovídá vaší morfologii se shodou ${score} %. S ${spacerMm} mm podložek pod představcem dosáhnete optimální výšky řídítek.${csTail}`,
  };
}

type LocalizedLists = Pick<
  PrePurchaseAnalysisResponse,
  | 'biomechanicalProsEn' | 'biomechanicalProsCs' | 'biomechanicalConsEn' | 'biomechanicalConsCs'
  | 'factoryComponentTrapsEn' | 'factoryComponentTrapsCs' | 'alternativeBikesEn' | 'alternativeBikesCs'
  | 'dealerChecklistEn' | 'dealerChecklistCs'
>;

function buildLocalizedLists(rider: RiderProfile, frame: StockFrame, fit: FitTargets): LocalizedLists {
  const pros = buildPros();
  const cons = buildCons({ ...fit, stockStackMm: frame.stackMm, stockReachMm: frame.reachMm });
  const traps = buildTraps(rider, frame);
  const alternatives = buildAlternatives();
  const checklist = buildChecklist(rider, frame, fit.spacerDeltaMm);
  return {
    biomechanicalProsEn: pros.en, biomechanicalProsCs: pros.cs,
    biomechanicalConsEn: cons.en, biomechanicalConsCs: cons.cs,
    factoryComponentTrapsEn: traps.en, factoryComponentTrapsCs: traps.cs,
    alternativeBikesEn: alternatives.en, alternativeBikesCs: alternatives.cs,
    dealerChecklistEn: checklist.en, dealerChecklistCs: checklist.cs,
  };
}

/** Deterministic report used when the Gemini API key is missing or the service is unavailable. */
export function generateDeterministicAnalysis(input: PrePurchaseAnalysisRequest): PrePurchaseAnalysisResponse {
  const rider = input.riderProfile;
  const frame = bestFrameOf(rider, input.geometry);
  const fit = computeFitTargets(rider, frame);
  /* The stock frame table is made of road bikes: for a mountain bike the factory bar is unknown (the checklist asks for it). */
  const alerts = applyBiomechanicalRules(rider, isMtbAudit(rider) ? null : frame.barWidthMm, frame.crankMm);
  const summary = summaryFor(input.bikeModelName, frame.size, fit.fitMatchScore, fit.spacerDeltaMm, alerts.length > 0);
  return {
    fitMatchScore: fit.fitMatchScore,
    recommendedFrameSize: frame.size,
    stackMatch: { recommendedStackMm: fit.recommendedStackMm, stockStackMm: frame.stackMm, spacerDeltaMm: fit.spacerDeltaMm },
    reachMatch: { recommendedReachMm: fit.recommendedReachMm, stockReachMm: frame.reachMm, stemDeltaMm: fit.stemDeltaMm },
    componentMismatchAlerts: alerts,
    overallSummaryEn: summary.en,
    overallSummaryCs: summary.cs,
    ...buildLocalizedLists(rider, frame, fit),
  };
}
