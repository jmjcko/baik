import type { Locale, Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { ESTIMATES } from '@/lib/engines/baikfit/estimates';
import { forbidsLongerStem, forbidsSaddleForward, loweringGuard, needsPositionChecks, positionContextOf, type PositionContext } from '@/lib/engines/baikfit/dropRules';
import { KB_RULES } from '@/lib/engines/baikfit/kbRules';
import { evaluateStockBikeFit } from '@/lib/bikes/evaluateStockBikeFit';
import { resolveStockBike, type ResolvedStockBike } from '@/lib/bikes/resolve';
import type { StockFitAuditResult, StockSelection } from '@/lib/bikes/types';
import { deriveCoordinates, type ProfileValues } from '@/lib/profile/values';
import { profileToPassport } from '@/lib/passport/mappers';
import type { FactoryComponentTrap, RiderPainType, RidingDiscipline, RidingStyle } from '@/types/baikfit';
import { DEFAULT_PROFILE } from '@/lib/profile/values';

/** A saddle shift below the 3 mm tolerance of KB 1.1 is within the accuracy of a measurement, so the saddle stays in the middle. */
const SADDLE_KEEP_MM = KB_RULES.saddleToleranceMm;
/** Stems come in 10 mm steps: a reach difference below half a step needs no new stem. */
const REACH_KEEP_MM = 5;
/** The factory spacer height is an assumption (makers do not publish it), so a change up to 10 mm is within its error and is not advised. */
const ASSUMED_SPACER_NOISE_MM = 10;

type Texts = Translations['stockBike']['audit'];

export interface StockAuditView {
  origin: ResolvedStockBike['origin'];
  /** The label of the source: the maker's table, the community, the owner, or the AI that must be checked. */
  badge: string;
  bikeLine: string;
  sourceLine: string | null;
  fitScore: string;
  sizeText: string;
  /** Every instruction carries the biomechanical reason (KB v1.4.0, section 10). */
  saddle: { text: string; warning: string | null; deltaMm: number; reason: string };
  spacers: { text: string; warning: string | null; nowMm: number; goalMm: number; reason: string };
  reachText: string;
  reachReason: string;
  assumptions: string[];
  traps: FactoryComponentTrap[];
  unknownNote: string | null;
}

function badgeOf(a: Texts, resolved: ResolvedStockBike): string {
  if (resolved.origin === 'ai') return a.badgeAi;
  if (resolved.origin === 'seed') return a.badgeSeed;
  return resolved.community?.origin === 'owner' ? a.badgeOwner : fill(a.badgeCommunity, { n: resolved.community?.confirmations ?? 0 });
}

function sizeText(a: Texts, result: StockFitAuditResult, resolved: ResolvedStockBike): string {
  const { size, selectedIsBest } = result.recommendedSize;
  if (resolved.bike.sizeOrder.length < 2) return a.sizeOnlyOne;
  return selectedIsBest ? fill(a.sizeBest, { size: resolved.size }) : fill(a.sizeBetter, { best: size, size: resolved.size });
}

function saddleView(a: Texts, result: StockFitAuditResult, context: PositionContext) {
  const { deltaMm } = result.diy.saddleSetbackDeltaMm;
  const shown = Math.abs(deltaMm);
  /* Numb hands: the saddle never moves forward (KB backlog section 15). */
  if (deltaMm < 0 && shown >= SADDLE_KEEP_MM && forbidsSaddleForward(context)) return { text: a.saddleHoldForward, warning: null, deltaMm: 0, reason: a.reasons.saddleHoldForward };
  const text = shown < SADDLE_KEEP_MM ? a.saddleKeep : fill(deltaMm > 0 ? a.saddleBack : a.saddleForward, { delta: shown });
  const warning = result.diy.saddleOutOfRailRange ? fill(a.saddleOutOfRange, { range: ESTIMATES.saddleRailRangeMm.value }) : null;
  const reason = shown < SADDLE_KEEP_MM ? a.reasons.saddleKeep : deltaMm > 0 ? a.reasons.saddleBack : a.reasons.saddleForward;
  return { text, warning, deltaMm: shown < SADDLE_KEEP_MM ? 0 : deltaMm, reason };
}

/**
 * Lowering the handlebars is never ordered: a symptom or an endurance position forbids it, an assumed factory spacer height
 * is no ground for it, and with a published height it is only an option to try (KB backlog section 15).
 */
function loweringView(a: Texts, result: StockFitAuditResult, stockMm: number, context: PositionContext) {
  const { deltaMm, basis } = result.diy.spacerDeltaMm;
  const guard = loweringGuard(context);
  if (guard === 'symptom') return { text: a.spacerHoldSymptom, deltaMm: 0, reason: a.reasons.spacerHoldSymptom };
  if (guard) return { text: a.spacerHoldStyle, deltaMm: 0, reason: a.reasons.spacerHoldStyle };
  if (basis === 'assumed') return { text: a.spacerVerify, deltaMm: 0, reason: a.reasons.spacerVerify };
  return { text: fill(a.spacerConsider, { delta: Math.abs(deltaMm) }), deltaMm, reason: a.reasons.spacerConsider };
}

function spacerView(a: Texts, result: StockFitAuditResult, stockMm: number, context: PositionContext) {
  const { deltaMm } = result.diy.spacerDeltaMm;
  const warning = result.diy.spacersOverLimit ? fill(a.spacersOverLimit, { limit: KB_RULES.maxSpacerStackMm }) : null;
  if (deltaMm < 0) {
    const lowering = loweringView(a, result, stockMm, context);
    return { text: lowering.text, warning, nowMm: stockMm, goalMm: Math.max(0, stockMm + lowering.deltaMm), reason: lowering.reason };
  }
  /* A small change on an assumed height is noise; a rider with a symptom of the position may still be told to raise the handlebars. */
  if (deltaMm > 0 && deltaMm <= ASSUMED_SPACER_NOISE_MM && result.diy.spacerDeltaMm.basis === 'assumed' && !needsPositionChecks(context)) return { text: a.spacerVerify, warning, nowMm: stockMm, goalMm: stockMm, reason: a.reasons.spacerVerify };
  const text = deltaMm === 0 ? a.spacerKeep : fill(a.spacerAdd, { delta: deltaMm });
  return { text, warning, nowMm: stockMm, goalMm: Math.max(0, stockMm + deltaMm), reason: deltaMm === 0 ? a.reasons.spacerKeep : a.reasons.spacerAdd };
}

function reachView(a: Texts, deltaMm: number, context: PositionContext): { text: string; reason: string } {
  if (Math.abs(deltaMm) < REACH_KEEP_MM) return { text: a.reachKeep, reason: a.reasons.reachKeep };
  if (deltaMm > 0 && forbidsLongerStem(context)) return { text: a.reachHoldLonger, reason: a.reasons.reachHoldLonger };
  return { text: fill(deltaMm > 0 ? a.reachLonger : a.reachShorter, { delta: Math.abs(deltaMm) }), reason: deltaMm > 0 ? a.reasons.reachLonger : a.reasons.reachShorter };
}

function assumptionNotes(a: Texts, result: StockFitAuditResult): string[] {
  const notes: string[] = [];
  if (result.diy.spacerDeltaMm.basis === 'assumed') notes.push(fill(a.assumedSpacers, { value: ESTIMATES.assumedStockSpacersMm.value }));
  if (result.diy.saddleSetbackDeltaMm.basis === 'assumed') notes.push(fill(a.assumedOffset, { value: ESTIMATES.assumedStockSeatpostOffsetMm.value }));
  return notes;
}

function unknownNote(a: Texts, result: StockFitAuditResult): string | null {
  const parts = result.unknownComponents.filter((c) => c !== 'spacers' && c !== 'seatpostOffset').map((c) => a.components[c]);
  return parts.length ? fill(a.unknownNote, { list: parts.join(', ') }) : null;
}

/**
 * The stock bike audit as lines of text for the report, or null when the rider has no stock bike (or the seed no longer
 * has it). The factory spacers and the seat post offset are published by no maker: they are assumptions and the notes say so.
 */
export function buildStockAudit(t: Translations, locale: Locale, selection: StockSelection | null, values: ProfileValues): StockAuditView | null {
  const resolved = resolveStockBike(selection, values.discipline);
  if (!resolved) return null;
  const a = t.stockBike.audit;
  const context = positionContextOf({ pains: values.currentPains, style: values.ridingStyle, hamstringTest: values.hamstringTest, releaseTest: values.releaseTest });
  const passport = profileToPassport(values, deriveCoordinates(values));
  const result = evaluateStockBikeFit(passport, resolved.bike, resolved.size, { crankRule: 'always' });
  const reach = reachView(a, result.diy.reachDeltaMm, context);
  const { bike, size, origin } = resolved;
  const stockSpacers = resolved.spec.stockSpacersMm ?? ESTIMATES.assumedStockSpacersMm.value;
  return {
    origin,
    badge: badgeOf(a, resolved),
    bikeLine: fill(a.bikeLine, { brand: bike.brand, model: bike.model, year: bike.years[0], size }),
    sourceLine: origin === 'seed' ? fill(a.sourceLine, { source: bike.source.name, date: bike.source.verifiedOn }) : null,
    fitScore: fill(a.fitScore, { score: result.fitMatchScore }),
    sizeText: sizeText(a, result, resolved),
    saddle: saddleView(a, result, context),
    spacers: spacerView(a, result, stockSpacers, context),
    reachText: reach.text,
    reachReason: reach.reason,
    assumptions: assumptionNotes(a, result),
    traps: locale === 'cs' ? result.traps.cs : result.traps.en,
    unknownNote: unknownNote(a, result),
  };
}

/** What the report knows about the rider (some values are optional there); the rest comes from the defaults of the profile. */
export interface ReportValuesInput {
  inseamMm: number;
  acromionWidthMm: number;
  crankLengthMm: number;
  riderWeightKg: number;
  heightCm?: number;
  torsoLengthMm?: number;
  armLengthMm?: number;
  discipline?: RidingDiscipline;
  ridingStyle?: RidingStyle;
  currentSaddleHeightMm: number | null;
  currentBarWidthMm: number | null;
  currentPains: RiderPainType[];
  stockBike?: StockSelection | null;
  hamstringTest?: ProfileValues['hamstringTest'];
  releaseTest?: ProfileValues['releaseTest'];
}

export function reportValues(input: ReportValuesInput): ProfileValues {
  return {
    ...DEFAULT_PROFILE,
    ...input,
    heightCm: input.heightCm ?? DEFAULT_PROFILE.heightCm,
    torsoLengthMm: input.torsoLengthMm ?? DEFAULT_PROFILE.torsoLengthMm,
    armLengthMm: input.armLengthMm ?? DEFAULT_PROFILE.armLengthMm,
    discipline: input.discipline ?? DEFAULT_PROFILE.discipline,
    ridingStyle: input.ridingStyle ?? DEFAULT_PROFILE.ridingStyle,
    stockBike: input.stockBike ?? null,
  };
}
