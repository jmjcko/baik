import type { ComponentMismatchAlert, FactoryComponentTrap, RiderProfile } from '@/types/baikfit';
import { applyBiomechanicalRules } from '@/lib/analysis/biomechanicalRules';
import { barTrap, crankTrap } from '@/lib/analysis/deterministicTraps';
import type { Bilingual } from '@/lib/analysis/deterministicContent';
import type { StockFrame } from '@/lib/analysis/stockFrame';
import { ESTIMATES } from '@/lib/engines/baikfit/estimates';
import { recommendedBarWidthMm } from '@/lib/engines/baikfit/kbRules';

export interface StockTraps {
  alerts: ComponentMismatchAlert[];
  traps: { en: FactoryComponentTrap[]; cs: FactoryComponentTrap[] };
}

/** A stock bar clearly narrower than the recommended width: a hint of the app, the KB only describes bars that are too wide. */
function narrowBar(rider: RiderProfile, stockBarMm: number): { alert: ComponentMismatchAlert; trap: Bilingual<FactoryComponentTrap> } | null {
  const recommended = recommendedBarWidthMm(rider.acromionWidthMm);
  if (recommended - stockBarMm <= ESTIMATES.narrowBarToleranceMm.value) return null;
  const en = `The factory ${stockBarMm}mm handlebar is narrower than your shoulders (${rider.acromionWidthMm}mm): it pulls the shoulders inward, can restrict breathing and makes the steering twitchy. A ${recommended}mm bar matches your shoulder width.`;
  const cs = `Sériová ${stockBarMm}mm řídítka jsou užší než vaše ramena (${rider.acromionWidthMm} mm): stahují ramena dovnitř, mohou omezovat dýchání a kolo se řídí nervózněji. Řídítka ${recommended} mm odpovídají šířce vašich ramen.`;
  const note = { en: `Ask for a ${recommended}mm handlebar before delivery.`, cs: `Požádejte o ${recommended}mm řídítka ještě před expedicí.` };
  return {
    alert: {
      component: 'handlebar', stockSpec: `${stockBarMm}mm Factory Handlebar`, recommendedSpec: `${recommended}mm Ergonomic Handlebar`,
      reasoningEn: en, reasoningCs: cs, financialSavingsNoteEn: note.en, financialSavingsNoteCs: note.cs,
    },
    trap: {
      en: { component: 'Handlebar / Cockpit Width', stockSpec: `${stockBarMm}mm Factory Handlebar`, recommendedSpec: `${recommended}mm Ergonomic Handlebar`, riskExplanation: en, savingsNote: note.en },
      cs: { component: 'Šířka řídítek / Kokpit', stockSpec: `${stockBarMm} mm sériová řídítka`, recommendedSpec: `${recommended} mm ergonomická řídítka`, riskExplanation: cs, savingsNote: note.cs },
    },
  };
}

/**
 * Warnings about the stock handlebar (too wide or too narrow for the shoulders, KB 2.2) and the stock crank (too long,
 * KB 5 and 7). A component the maker does not publish (`stockBarMm` or `stockCrankMm` is null) gets no warning.
 */
export function buildStockTraps(rider: RiderProfile, frame: StockFrame, stockBarMm: number | null, stockCrankMm: number | null): StockTraps {
  /* 0 never triggers a rule, so an unpublished component simply produces no alert. */
  const alerts = applyBiomechanicalRules(rider, stockBarMm ?? 0, stockCrankMm ?? 0);
  const en: FactoryComponentTrap[] = [];
  const cs: FactoryComponentTrap[] = [];
  const add = (trap: Bilingual<FactoryComponentTrap>) => {
    en.push(trap.en);
    cs.push(trap.cs);
  };
  if (alerts.some((alert) => alert.component === 'handlebar')) add(barTrap(rider, frame));
  if (alerts.some((alert) => alert.component === 'crank')) add(crankTrap(rider, frame));
  const narrow = stockBarMm === null ? null : narrowBar(rider, stockBarMm);
  if (narrow) {
    alerts.push(narrow.alert);
    add(narrow.trap);
  }
  return { alerts, traps: { en, cs } };
}
