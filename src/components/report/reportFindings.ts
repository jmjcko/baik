import type { CustomSetup, SetupMode } from '@/lib/engines/baikfit/customSetup';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { crankNeedsChange } from '@/lib/engines/baikfit/advice';
import {
  KB_RULES,
  formatCrankRange,
  isBarTooWide,
  recommendedBarWidthMm,
  saddleAdjustment,
} from '@/lib/engines/baikfit/kbRules';
import type { HamstringLevel, ReleaseResult } from '@/lib/engines/baikfit/mobility';
import type { MtbSetup } from '@/lib/engines/baikfit/mtb';
import type { RiderPainType, RidingDiscipline, RidingStyle } from '@/types/baikfit';
import type { ModalTopic } from './EducationalModal';
import { reasonFor } from './reasons';

export type FindingTone = 'danger' | 'info' | 'warning';

export interface Finding {
  id: 'handlebar' | 'saddle' | 'crank' | 'pitch' | 'cleat';
  tone: FindingTone;
  badge: string;
  title: string;
  body: string;
  /** Why this is recommended to this rider (KB v1.4.0): always present. */
  reason: string;
  action?: string;
  modal: ModalTopic;
}

/** A finding before its reason is added (the reason needs the whole text set). */
type Draft = Omit<Finding, 'reason'>;

export interface FindingInput {
  inseamMm: number;
  acromionWidthMm: number;
  crankLengthMm: number;
  saddleHeightMm: number;
  currentBarWidthMm: number | null;
  currentSaddleHeightMm: number | null;
  /** What the rider reported and rides like: the position checks and the guards depend on it (KB backlog section 15). */
  currentPains?: RiderPainType[];
  ridingStyle?: RidingStyle;
  /** The two mobility mini-tests (Epic 26). */
  hamstringTest?: HamstringLevel | null;
  releaseTest?: ReleaseResult | null;
  /** The mountain bike: the drop bar rules of the handlebar do not apply to a flat bar (the MTB section judges it). */
  discipline?: RidingDiscipline;
  mtb?: MtbSetup;
  /** A modified bike (Epic 34): the numbers the rider measured, the plan compares them with the targets; the setback target is the one of the coordinates (mm behind the bottom bracket). */
  setupMode?: SetupMode;
  custom?: CustomSetup;
  setbackTargetMm?: number;
}

const range = ({ min, max }: { min: number; max: number }) => `${min}–${max} mm`;

function handlebarFinding(r: Translations['diagnosticReport'], input: FindingInput): Draft | null {
  if (input.discipline === 'xc_mtb') return null;
  const stock = input.currentBarWidthMm ?? KB_RULES.factoryBarWidthMm;
  if (!isBarTooWide(stock, input.acromionWidthMm)) return null;
  const recommended = recommendedBarWidthMm(input.acromionWidthMm);
  const entered = input.currentBarWidthMm !== null;
  return {
    id: 'handlebar',
    tone: 'danger',
    badge: r.handlebarBadge,
    title: entered
      ? fill(r.handlebarTitleCurrent, { current: stock, acromion: input.acromionWidthMm })
      : fill(r.handlebarTitle, { stock, acromion: input.acromionWidthMm }),
    body: r.handlebarBody,
    action: fill(r.handlebarAction, { recommended }),
    modal: 'ulnar',
  };
}

function saddleBody(r: Translations['diagnosticReport'], input: FindingInput): string {
  const steps = { raise: range(KB_RULES.saddleRaiseStepMm), lower: range(KB_RULES.saddleLowerStepMm) };
  if (input.currentSaddleHeightMm === null) {
    return fill(r.saddleBody, { kneeMin: KB_RULES.kneeExtensionAngleDeg.min, kneeMax: KB_RULES.kneeExtensionAngleDeg.max, ...steps });
  }
  const adjustment = saddleAdjustment(input.currentSaddleHeightMm, input.saddleHeightMm);
  const values = { current: input.currentSaddleHeightMm, target: input.saddleHeightMm, delta: adjustment.deltaMm, ...steps };
  const templates = { lower: r.saddleBodyLower, raise: r.saddleBodyRaise, none: r.saddleBodyOnTarget };
  return fill(templates[adjustment.direction], values);
}

function saddleFinding(r: Translations['diagnosticReport'], input: FindingInput): Draft {
  return {
    id: 'saddle',
    tone: 'info',
    badge: r.saddleBadge,
    title: fill(r.saddleTitle, { height: input.saddleHeightMm, inseam: input.inseamMm, factor: KB_RULES.lemondCoefficient }),
    body: saddleBody(r, input),
    modal: 'lemond',
  };
}

function crankFinding(r: Translations['diagnosticReport'], input: FindingInput): Draft | null {
  if (!crankNeedsChange(input.crankLengthMm)) return null;
  const crankRange = formatCrankRange();
  return {
    id: 'crank',
    tone: 'warning',
    badge: r.crankBadge,
    title: fill(r.crankTitle, { crank: input.crankLengthMm, range: crankRange }),
    body: r.crankBody,
    action: fill(r.crankAction, { range: crankRange }),
    modal: 'crank',
  };
}

function pitchFinding(r: Translations['diagnosticReport']): Draft {
  const values = { pitch: KB_RULES.saddlePitchMaxNoseDownDeg };
  return { id: 'pitch', tone: 'info', badge: r.pitchBadge, title: r.pitchTitle, body: fill(r.pitchBody, values), action: fill(r.pitchAction, values), modal: null };
}

function cleatFinding(r: Translations['diagnosticReport']): Draft {
  const values = { cleatMin: KB_RULES.cleatSetbackMm.min, cleatMax: KB_RULES.cleatSetbackMm.max };
  return { id: 'cleat', tone: 'info', badge: r.cleatBadge, title: r.cleatTitle, body: fill(r.cleatBody, values), action: fill(r.cleatAction, values), modal: null };
}

/** Component and setup findings of the report, all derived from the master KB rules; each carries the reason it is recommended. */
export function buildFindings(t: Translations, input: FindingInput): Finding[] {
  const r = t.diagnosticReport;
  const pitch = pitchFinding(r);
  const rest = [saddleFinding(r, input), handlebarFinding(r, input), crankFinding(r, input), cleatFinding(r)];
  /* With numb hands the tilt of the saddle is the first thing to check (KB v1.4.0, section 8). */
  const ordered = input.currentPains?.includes('numb_hands') ? [pitch, ...rest] : [rest[0], pitch, ...rest.slice(1)];
  return ordered.filter((draft): draft is Draft => draft !== null).map((draft) => ({ ...draft, reason: reasonFor(t, draft.id, input) }));
}
