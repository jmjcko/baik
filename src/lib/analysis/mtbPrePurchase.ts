import type { ComponentMismatchAlert, DealerChecklistItem, FactoryComponentTrap, RiderProfile } from '@/types/baikfit';
import { DEFAULT_MTB_SETUP, flatBarStatus, flatBarTargetMm } from '@/lib/engines/baikfit/mtb';
import { MTB_RULES, type MtbStyle } from '@/lib/engines/baikfit/mtbRules';
import type { Bilingual } from './deterministicContent';

/** True when the bike under audit is a mountain bike: its flat bar follows KB 11.2, not the drop bar rule of the acromion width (KB 2.2). */
export const isMtbAudit = (rider: Pick<RiderProfile, 'bikeKind'>): boolean => rider.bikeKind === 'xc_mtb';

const styleOf = (rider: Pick<RiderProfile, 'mtbStyle'>): MtbStyle => rider.mtbStyle ?? DEFAULT_MTB_SETUP.style;

/** The flat bar width the rider should look for, and the text of the rule behind it. */
export function flatBarTarget(rider: Pick<RiderProfile, 'acromionWidthMm' | 'mtbStyle'>): { targetMm: number; offsetMm: number; min: number; max: number } {
  const style = styleOf(rider);
  const { min, max } = MTB_RULES.barRangeMm[style];
  return { targetMm: flatBarTargetMm(rider.acromionWidthMm, style), offsetMm: MTB_RULES.barOffsetMm[style], min, max };
}

const STEM = `${MTB_RULES.stemRangeMm.min}–${MTB_RULES.stemRangeMm.max}`;

/** KB 11.2: a stock flat bar that is far from the target (wider also above 800 mm), with the stem tip; null without a stock bar or when it fits. */
export function flatBarAlert(rider: RiderProfile, stockBarMm: number | null): ComponentMismatchAlert | null {
  if (stockBarMm === null) return null;
  const { targetMm, offsetMm } = flatBarTarget(rider);
  const status = flatBarStatus(stockBarMm, targetMm);
  if (status === 'ok') return null;
  const a = rider.acromionWidthMm;
  const wide = status === 'wide';
  return {
    component: 'handlebar',
    stockSpec: `${stockBarMm}mm Factory Flat Bar`,
    recommendedSpec: `${targetMm}mm Flat Bar`,
    reasoningEn: `A flat bar for your shoulders (acromion ${a}mm) is about ${targetMm}mm (acromion + ${offsetMm}mm). The factory ${stockBarMm}mm bar is ${wide ? 'wider' : 'narrower'}: ${wide ? 'a bar over 800mm or well above the target over-rotates the shoulders and strains the neck and trapezius' : 'less leverage for steering over obstacles'}. Keep the stem in the usual ${STEM}mm: it is about 10mm shorter for every 20mm of extra bar width.`,
    reasoningCs: `Rovná řídítka pro vaše ramena (akromion ${a} mm) mají asi ${targetMm} mm (akromion + ${offsetMm} mm). Sériová ${stockBarMm}mm řídítka jsou ${wide ? 'širší' : 'užší'}: ${wide ? 'řídítka nad 800 mm nebo hodně nad cílem přetáčejí ramena a přetěžují krk a trapéz' : 'méně páky pro řízení přes překážky'}. Držte představec v obvyklých ${STEM} mm: je asi o 10 mm kratší na každých 20 mm šířky řídítek navíc.`,
    financialSavingsNoteEn: `Ask the dealer for a ${targetMm}mm flat bar (or to trim it) before delivery.`,
    financialSavingsNoteCs: `Požádejte prodejce o rovná řídítka ${targetMm} mm (nebo o jejich zkrácení) před expedicí.`,
  };
}

/** The flat bar line of the factory component list: the stock bar is unknown, so it says what to look for. */
export function flatBarTrap(rider: RiderProfile): Bilingual<FactoryComponentTrap> {
  const { targetMm, offsetMm, min, max } = flatBarTarget(rider);
  const a = rider.acromionWidthMm;
  return {
    en: {
      component: 'Flat Bar / Cockpit Width',
      stockSpec: 'Check the width and the stem on the bike page',
      recommendedSpec: `${targetMm}mm flat bar, ${STEM}mm stem`,
      riskExplanation: `A flat bar does not follow the 1:1 rule of drop bars. For your acromion of ${a}mm the target is ${targetMm}mm (acromion + ${offsetMm}mm, between ${min} and ${max}mm). Wider bars go with shorter stems: about 10mm shorter for every 20mm of extra width.`,
      savingsNote: 'A bar can be trimmed or swapped by the dealer before delivery; a stem swap after delivery costs a few hundred CZK.',
    },
    cs: {
      component: 'Rovná řídítka / Kokpit',
      stockSpec: 'Zkontrolujte šířku a představec na stránce kola',
      recommendedSpec: `rovná řídítka ${targetMm} mm, představec ${STEM} mm`,
      riskExplanation: `Rovná řídítka se neřídí pravidlem 1:1 jako berany. Pro váš akromion ${a} mm je cíl ${targetMm} mm (akromion + ${offsetMm} mm, v rozsahu ${min} až ${max} mm). Širší řídítka patří ke kratším představcům: asi o 10 mm kratší na každých 20 mm šířky navíc.`,
      savingsNote: 'Řídítka může prodejce zkrátit nebo vyměnit před expedicí; výměna představce po dodání stojí několik set korun.',
    },
  };
}

/** The dealer checklist line for the bar and the stem of a mountain bike. */
export function flatBarChecklist(rider: RiderProfile): Bilingual<DealerChecklistItem> {
  const { targetMm } = flatBarTarget(rider);
  return {
    en: { action: 'Confirm the flat bar width and the stem length', detail: `Ask for a ${targetMm}mm flat bar (it can be trimmed) with a ${STEM}mm stem; do not accept a drop bar fit rule for a flat bar.` },
    cs: { action: 'Ověřte šířku rovných řídítek a délku představce', detail: `Požádejte o rovná řídítka ${targetMm} mm (lze je zkrátit) a představec ${STEM} mm; pro rovná řídítka neplatí pravidlo pro berany.` },
  };
}

/** The rules that the AI follows for a mountain bike (added to the prompt in English, the language of the KB prompt). */
export function mtbPromptRules(rider: RiderProfile): string {
  const { targetMm, offsetMm, min, max } = flatBarTarget(rider);
  return `This is a MOUNTAIN BIKE with a FLAT handlebar (${styleOf(rider) === 'trail' ? 'Trail' : 'XC'}). Do NOT apply the drop bar rules of the KB (handlebar width equal to the acromion width, commercial widths 380-440 mm, the 420 mm factory trap, the ulnar risk of a wide drop bar).
Use KB section 11 instead: the flat bar target is the acromion width + ${offsetMm} mm = ${targetMm} mm for this rider, rounded to 10 mm and kept between ${min} and ${max} mm; a bar over 800 mm is too wide. Modern mountain bikes pair wide bars with stems of ${STEM} mm, and the stem is about 10 mm shorter for every 20 mm of extra bar width. Report the handlebar as an alert only when the stock flat bar is more than 20 mm wider or narrower than ${targetMm} mm, and a stem as an alert only when it is outside ${STEM} mm.`;
}
