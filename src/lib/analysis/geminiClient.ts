import type { PrePurchaseAnalysisRequest, PrePurchaseAnalysisResponse } from '@/types/baikfit';
import { getDomainSystemPrompt } from '@/lib/kbLoader';
import { applyBiomechanicalRules } from './biomechanicalRules';
import { bestFrameOf } from './geometryFrame';
import { generateDeterministicAnalysis } from './deterministicAnalysis';
import { isMtbAudit, mtbPromptRules } from './mtbPrePurchase';

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const ROLE_INSTRUCTION = `You are bAIkfit AI, an expert biomechanical bike fitting and geometry analysis engine.
Your task is to conduct an in-depth, expert biomechanical pre-purchase audit of the candidate bicycle model.
Compare the bike's geometry table (Stack, Reach, Effective Top Tube, Seat Tube Angle) and factory stock component specs (Handlebar Width, Crank Length, Stem Length) against the rider's morphology and biomechanics.`;

const POINT_SCHEMA = '[ { "title": string, "detail": string } ]';
const TRAP_SCHEMA = `[
    {
      "component": string,
      "stockSpec": string,
      "recommendedSpec": string,
      "riskExplanation": string,
      "savingsNote": string
    }
  ]`;
const ALTERNATIVE_SCHEMA = `[
    {
      "modelName": string,
      "reasonWhyBetter": string,
      "stackReachComparison": string
    }
  ]`;
const CHECKLIST_SCHEMA = '[ { "action": string, "detail": string } ]';

const RESPONSE_SCHEMA = `Output STRICT JSON conforming to the following structure:
{
  "fitMatchScore": number (0 - 100),
  "recommendedFrameSize": string,
  "stackMatch": { "recommendedStackMm": number, "stockStackMm": number, "spacerDeltaMm": number },
  "reachMatch": { "recommendedReachMm": number, "stockReachMm": number, "stemDeltaMm": number },
  "componentMismatchAlerts": [
    {
      "component": "handlebar" | "crank" | "saddle" | "stem",
      "stockSpec": string,
      "recommendedSpec": string,
      "reasoningEn": string,
      "reasoningCs": string,
      "financialSavingsNoteEn": string,
      "financialSavingsNoteCs": string
    }
  ],
  "overallSummaryEn": string,
  "overallSummaryCs": string,
  "biomechanicalProsEn": ${POINT_SCHEMA},
  "biomechanicalProsCs": ${POINT_SCHEMA},
  "biomechanicalConsEn": ${POINT_SCHEMA},
  "biomechanicalConsCs": ${POINT_SCHEMA},
  "factoryComponentTrapsEn": ${TRAP_SCHEMA},
  "factoryComponentTrapsCs": ${TRAP_SCHEMA},
  "alternativeBikesEn": ${ALTERNATIVE_SCHEMA},
  "alternativeBikesCs": ${ALTERNATIVE_SCHEMA},
  "dealerChecklistEn": ${CHECKLIST_SCHEMA},
  "dealerChecklistCs": ${CHECKLIST_SCHEMA}
}
Do not include markdown fences or explanation outside the JSON.`;

const LIST_FIELDS = [
  'biomechanicalProsEn', 'biomechanicalProsCs', 'biomechanicalConsEn', 'biomechanicalConsCs',
  'factoryComponentTrapsEn', 'factoryComponentTrapsCs', 'alternativeBikesEn', 'alternativeBikesCs',
  'dealerChecklistEn', 'dealerChecklistCs',
] as const;

export function buildSystemInstruction(locale: 'en' | 'cs', rider?: PrePurchaseAnalysisRequest['riderProfile']): string {
  const mtb = rider && isMtbAudit(rider) ? `\n\n${mtbPromptRules(rider)}` : '';
  return `${getDomainSystemPrompt('baikfit', locale)}\n\n${ROLE_INSTRUCTION}${mtb}\n\n${RESPONSE_SCHEMA}`;
}

/** Prompt lines for the rider's current bike, only for the values that were entered. */
function currentSetupLines(r: PrePurchaseAnalysisRequest['riderProfile']): string {
  const lines = [
    r.currentCrankLengthMm ? `Current crank length: ${r.currentCrankLengthMm} mm` : null,
    r.currentSaddleHeightMm ? `Current saddle height: ${r.currentSaddleHeightMm} mm` : null,
    r.currentBarWidthMm ? `Current handlebar width: ${r.currentBarWidthMm} mm` : null,
  ].filter((line): line is string => line !== null);
  return lines.length ? `\n${lines.map((line) => `- ${line}`).join('\n')}` : '';
}

/** The kind of the bike for the prompt: a flat bar mountain bike has other rules than a drop bar bike. */
function kindLine(r: PrePurchaseAnalysisRequest['riderProfile']): string {
  if (isMtbAudit(r)) return `mountain bike (${r.mtbStyle === 'trail' ? 'Trail' : 'XC'}), flat handlebar`;
  return r.bikeKind === 'gravel' ? 'gravel bike, drop handlebar' : 'road bike, drop handlebar';
}

/** The geometry of the bike for the prompt: the numbers of the maker's table, which the model must use and never replace with its memory. */
function geometryLines(geometry: PrePurchaseAnalysisRequest['geometry']): string {
  if (!geometry) return '';
  const mm = (value: number | null) => (value === null ? 'not stated' : `${value} mm`);
  const rows = geometry.sizes.map(({ size, spec }) => `- Size ${size}: stack ${spec.frameStackMm} mm, reach ${spec.frameReachMm} mm, seat angle ${spec.seatTubeAngleDeg} deg, stem ${mm(spec.stockStemMm)}, handlebar ${mm(spec.stockHandlebarMm)}, cranks ${mm(spec.stockCrankMm)}`);
  const origin = geometry.source === 'rider' ? "the maker's table supplied by the rider" : 'the bAIk catalog';
  return `Geometry of this bike (from ${origin}); these numbers are authoritative, never use numbers from your own memory:\n${rows.join('\n')}\nThe app picks the frame size and computes the stack and reach match itself: explain the fit, the factory parts and the alternatives in words.`;
}

export function buildUserPrompt(input: PrePurchaseAnalysisRequest): string {
  const r = input.riderProfile;
  return `Analyze the following bike and rider profile:
Bicycle Model: ${input.bikeModelName}
${geometryLines(input.geometry)}

Rider Profile:
- Height: ${r.heightCm} cm
- Inseam: ${r.inseamMm} mm
- Torso Length: ${r.torsoLengthMm} mm
- Arm Length: ${r.armLengthMm} mm
- Acromion Shoulder Width: ${r.acromionWidthMm} mm
- Rider Weight: ${r.riderWeightKg} kg
- Kind of bike: ${kindLine(r)}
- Riding Style: ${r.ridingStyle}
- Flexibility: ${r.flexibilityScore}
- Reported Pains: ${r.currentPains.join(', ')}${currentSetupLines(r)}

Ensure the JSON adheres strictly to the schema. Include Czech (Cs) and English (En) localized reasoning and summaries.`;
}

/** Merge the model output with the deterministic fallback and the clinical guardrails. */
export function mergeWithGuardrails(
  parsed: PrePurchaseAnalysisResponse,
  input: PrePurchaseAnalysisRequest
): PrePurchaseAnalysisResponse {
  const fallback = generateDeterministicAnalysis(input);
  const modelAlerts = parsed.componentMismatchAlerts;
  const frame = bestFrameOf(input.riderProfile, input.geometry);
  /* The factory parts are those of the table of the bike; a part that the table does not state raises no rule, and a default is never assumed. */
  const ruleAlerts = applyBiomechanicalRules(input.riderProfile, frame.barWidthMm || null, frame.crankMm);
  const alerts = [...(modelAlerts || fallback.componentMismatchAlerts)];
  for (const alert of ruleAlerts) {
    if (!alerts.some((a) => a.component === alert.component)) alerts.push(alert);
  }
  const lists = Object.fromEntries(
    LIST_FIELDS.map((field) => [field, parsed[field]?.length ? parsed[field] : fallback[field]])
  );
  /* The numbers of the audit come from the table of the bike, never from the model. */
  const numbers = { fitMatchScore: fallback.fitMatchScore, recommendedFrameSize: fallback.recommendedFrameSize, stackMatch: fallback.stackMatch, reachMatch: fallback.reachMatch };
  return { ...fallback, ...parsed, ...numbers, componentMismatchAlerts: alerts, ...lists };
}

/** Calls Gemini; resolves to null when the service answers without usable content. */
export async function requestGeminiAnalysis(
  apiKey: string,
  input: PrePurchaseAnalysisRequest
): Promise<PrePurchaseAnalysisResponse | null> {
  const response = await fetch(GEMINI_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: buildSystemInstruction(input.locale ?? 'en', input.riderProfile) }] },
      contents: [{ role: 'user', parts: [{ text: buildUserPrompt(input) }] }],
      generationConfig: { response_mime_type: 'application/json', temperature: 0.1 },
    }),
  });
  if (!response.ok) return null;
  const payload = await response.json();
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  return text ? mergeWithGuardrails(JSON.parse(text) as PrePurchaseAnalysisResponse, input) : null;
}
