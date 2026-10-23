import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { assessBar } from '@/lib/engines/baikfit/advice';
import { forbidsLongerStem } from '@/lib/engines/baikfit/dropRules';
import type { FindingInput } from './reportFindings';

export type ReasonId = 'saddle' | 'handlebar' | 'crank' | 'pitch' | 'cleat' | 'reach' | 'drop';

type ReasonTexts = Translations['diagnosticReport']['reasons'];

const pains = (input: FindingInput) => input.currentPains ?? [];

/** The handlebar: the width in numbers when it is too wide, else a check that names the symptom that makes it worth verifying. */
function handlebarReason(r: ReasonTexts, input: FindingInput): string {
  const bar = assessBar(input.currentBarWidthMm, input.acromionWidthMm);
  const values = { excess: bar.excessMm, stock: bar.stockMm, acromion: input.acromionWidthMm };
  if (bar.tooWide) return fill(bar.entered ? r.handlebarWide : r.handlebarWideFactory, values);
  return forbidsLongerStem({ pains: pains(input) }) ? fill(r.handlebarCheck, values) : fill(r.handlebarWide, values);
}

/** The drop: the general explanation, then one sentence per symptom that the rider reported (numb hands first). */
function dropReason(r: ReasonTexts, input: FindingInput): string {
  const reported = pains(input);
  const parts = [r.drop, reported.includes('numb_hands') ? r.dropHands : null, reported.includes('neck_pain') ? r.dropNeck : null, reported.includes('lower_back') ? r.dropBack : null];
  return parts.filter(Boolean).join(' ');
}

/**
 * The human biomechanical reason of a recommendation (KB v1.3.0, section 10), written for this rider: it names the rider's
 * own numbers and symptoms where they change the explanation. Every finding and every step of the plan carries one.
 */
export function reasonFor(t: Translations, id: ReasonId, input: FindingInput): string {
  const r = t.diagnosticReport.reasons;
  switch (id) {
    case 'saddle':
      return r.saddleHeight;
    case 'pitch':
      return pains(input).includes('numb_hands') ? r.pitchHands : r.pitch;
    case 'handlebar':
      return handlebarReason(r, input);
    case 'crank':
      return r.crank;
    case 'cleat':
      return pains(input).some((pain) => pain === 'front_knee' || pain === 'back_knee') ? r.cleatKnee : r.cleat;
    case 'reach':
      return r.reach;
    default:
      return dropReason(r, input);
  }
}
