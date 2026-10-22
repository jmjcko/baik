import type { ComponentMismatchAlert, RiderProfile } from '@/types/baikfit';
import {
  KB_RULES,
  formatCrankRange,
  isBarTooWide,
  isCrankOversized,
  recommendedBarWidthMm,
} from '@/lib/engines/baikfit/kbRules';

const SAVINGS_CZK = `${KB_RULES.savingsCzk.min.toLocaleString('en-US')}–${KB_RULES.savingsCzk.max.toLocaleString('en-US')} CZK`;
const SAVINGS_CZK_CS = `${KB_RULES.savingsCzk.min.toLocaleString('cs-CZ')}–${KB_RULES.savingsCzk.max.toLocaleString('cs-CZ')} Kč`;

/** KB 2.2: the handlebar must equal the acromion width (1:1) in the nearest commercial width. */
function handlebarAlert(rider: RiderProfile, stockBarWidthMm: number): ComponentMismatchAlert | null {
  if (!isBarTooWide(stockBarWidthMm, rider.acromionWidthMm)) return null;
  const recommended = recommendedBarWidthMm(rider.acromionWidthMm);
  const acromion = rider.acromionWidthMm;
  return {
    component: 'handlebar',
    stockSpec: `${stockBarWidthMm}mm Factory Handlebar`,
    recommendedSpec: `${recommended}mm Ergonomic Handlebar`,
    reasoningEn: `Handlebar width must equal your acromion shoulder width (${acromion}mm), which means a ${recommended}mm bar. The factory ${stockBarWidthMm}mm handlebar is wider: it forces outward elbow flare or wrist rolling, compresses the ulnar nerve (numbness in the pinky and ring fingers) and strains the trapezius.`,
    reasoningCs: `Šířka řídítek musí odpovídat šířce vašich ramen v akromionu (${acromion} mm), tedy ${recommended} mm. Sériová ${stockBarWidthMm}mm řídítka jsou širší: nutí lokty do stran nebo rotaci zápěstí, utlačují ulnární nerv (brnění malíčku a prsteníčku) a přetěžují trapézové svaly.`,
    financialSavingsNoteEn: `Request a free handlebar swap to ${recommended}mm before delivery. Replacing an integrated cockpit later costs roughly ${SAVINGS_CZK}.`,
    financialSavingsNoteCs: `Požádejte prodejce o výměnu za ${recommended}mm řídítka před expedicí. Pozdější výměna integrovaného kokpitu vyjde zhruba na ${SAVINGS_CZK_CS}.`,
  };
}

/** KB 5 / 7: oversized cranks are flagged for limited flexibility or high body mass. */
function crankAlert(rider: RiderProfile, stockCrankMm: number): ComponentMismatchAlert | null {
  if (!isCrankOversized(stockCrankMm, rider)) return null;
  const range = formatCrankRange();
  return {
    component: 'crank',
    stockSpec: `${stockCrankMm}mm Factory Cranks`,
    recommendedSpec: `${range}mm Short Cranks`,
    reasoningEn: `Factory ${stockCrankMm}mm cranks are oversized for your morphology and flexibility. Cranks of ${range} mm reduce knee height at top dead center, open the hip angle (preventing hip impingement and thigh-against-abdomen collision) and allow a lower handlebar position without restricting breathing.`,
    reasoningCs: `Sériové ${stockCrankMm}mm kliky jsou pro vaši postavu a flexibilitu příliš dlouhé. Kliky ${range} mm snižují výšku kolene v horní úvrati, otevírají kyčelní úhel (brání sevření kyčle a kolizi stehna s břichem) a umožňují nižší pozici řídítek bez omezení dýchání.`,
    financialSavingsNoteEn: `Ask the dealer whether the build option allows ${range}mm crankarms during order configuration.`,
    financialSavingsNoteCs: `Ověřte u prodejce, zda specifikace sady umožňuje volbu ${range}mm klik přímo při objednávce kola.`,
  };
}

/** Deterministic clinical guardrails applied on top of (or instead of) the AI output. */
export function applyBiomechanicalRules(
  rider: RiderProfile,
  stockBarWidthMm: number = KB_RULES.factoryBarWidthMm,
  stockCrankLengthMm: number = KB_RULES.factoryCrankMm
): ComponentMismatchAlert[] {
  const alerts = [handlebarAlert(rider, stockBarWidthMm), crankAlert(rider, stockCrankLengthMm)];
  return alerts.filter((alert): alert is ComponentMismatchAlert => alert !== null);
}
