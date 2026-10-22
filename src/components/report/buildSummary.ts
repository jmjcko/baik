import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import type { BikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import { assessBar, assessCrank } from '@/lib/engines/baikfit/advice';
import { KB_RULES, formatCrankRange, saddleAdjustment } from '@/lib/engines/baikfit/kbRules';
import type { RidingDiscipline } from '@/types/baikfit';
import type { FindingInput } from './reportFindings';

export interface SummaryRow {
  label: string;
  value: string;
}

export interface SetupRow {
  key: 'saddle' | 'pitch' | 'handlebar' | 'crank' | 'cleat' | 'setback' | 'stack' | 'reach';
  label: string;
  now: string;
  target: string;
  change: string;
  /** True for numbers the knowledge base does not define yet. */
  estimate: boolean;
}

export interface ReportSummary {
  measures: SummaryRow[];
  setup: SetupRow[];
}

export interface SummaryInput extends FindingInput {
  heightCm?: number;
  torsoLengthMm?: number;
  armLengthMm?: number;
  riderWeightKg: number;
  discipline: RidingDiscipline;
  coordinates: BikeFitCoordinates;
}

const NONE = '–';
const mm = (value: number) => `${value} mm`;
const signed = (value: number) => `${value > 0 ? '+' : '−'}${Math.abs(value)} mm`;

function measureRows(t: Translations, input: SummaryInput): SummaryRow[] {
  const s = t.diagnosticReport.summary;
  const rows: Array<SummaryRow | null> = [
    { label: s.discipline, value: t.studio.disciplines[input.discipline] },
    { label: s.inseam, value: mm(input.inseamMm) },
    { label: s.shoulders, value: mm(input.acromionWidthMm) },
    input.torsoLengthMm === undefined ? null : { label: s.torso, value: mm(input.torsoLengthMm) },
    input.armLengthMm === undefined ? null : { label: s.arm, value: mm(input.armLengthMm) },
    input.heightCm === undefined ? null : { label: s.height, value: `${input.heightCm} cm` },
    { label: s.weight, value: `${input.riderWeightKg} kg` },
  ];
  return rows.filter((row): row is SummaryRow => row !== null);
}

function saddleRow(t: Translations, input: SummaryInput): SetupRow {
  const target = input.saddleHeightMm;
  const current = input.currentSaddleHeightMm;
  const adjustment = current === null ? null : saddleAdjustment(current, target);
  const change = adjustment === null ? NONE : adjustment.direction === 'none' ? t.diagnosticReport.summary.ok : signed(adjustment.direction === 'raise' ? adjustment.deltaMm : -adjustment.deltaMm);
  return { key: 'saddle', label: t.studio.saddleY, now: current === null ? NONE : mm(current), target: mm(target), change, estimate: false };
}

function barRow(t: Translations, input: SummaryInput): SetupRow {
  const bar = assessBar(input.currentBarWidthMm, input.acromionWidthMm);
  const change = !bar.entered ? NONE : bar.tooWide ? signed(bar.recommendedMm - bar.stockMm) : t.diagnosticReport.summary.ok;
  return { key: 'handlebar', label: t.diagnosticReport.targets.handlebarLabel, now: bar.entered ? mm(bar.stockMm) : NONE, target: mm(bar.recommendedMm), change, estimate: false };
}

function crankRow(t: Translations, input: SummaryInput): SetupRow {
  const crank = assessCrank(input.crankLengthMm);
  const change = crank.kneeHigherMm > 0 ? signed(-crank.kneeHigherMm) : t.diagnosticReport.summary.ok;
  return { key: 'crank', label: t.diagnosticReport.targets.crankLabel, now: mm(crank.currentMm), target: `${formatCrankRange()} mm`, change, estimate: false };
}

function estimateRows(t: Translations, coordinates: BikeFitCoordinates): SetupRow[] {
  const estimate = (key: SetupRow['key'], label: string, value: number): SetupRow => ({ key, label, now: NONE, target: mm(value), change: t.diagnosticReport.estimateChip, estimate: true });
  return [
    estimate('setback', t.studio.saddleX, coordinates.saddle.setbackXMm),
    estimate('stack', t.studio.stack, coordinates.cockpit.stackYMm),
    estimate('reach', t.studio.reach, coordinates.cockpit.reachXMm),
  ];
}

/** The dimensions of the report as plain rows: the rider's measurements and the bike setup now against the target. */
export function buildSummary(t: Translations, input: SummaryInput): ReportSummary {
  const s = t.diagnosticReport.summary;
  const pitch = KB_RULES.saddlePitchMaxNoseDownDeg;
  const { min, max } = KB_RULES.cleatSetbackMm;
  return {
    measures: measureRows(t, input),
    setup: [
      saddleRow(t, input),
      { key: 'pitch', label: t.diagnosticReport.actionPlan.pitchTitle, now: NONE, target: fill(s.pitchTarget, { pitch }), change: NONE, estimate: false },
      barRow(t, input),
      crankRow(t, input),
      { key: 'cleat', label: t.diagnosticReport.actionPlan.cleatTitle, now: NONE, target: fill(s.cleatTarget, { min, max }), change: NONE, estimate: false },
      ...estimateRows(t, input.coordinates),
    ],
  };
}
