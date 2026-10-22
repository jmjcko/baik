import type { DealerChecklistItem, FactoryComponentTrap, RiderProfile } from '@/types/baikfit';
import type { StockFrame } from './stockFrame';
import type { Bilingual } from './deterministicContent';
import { KB_RULES, formatCrankRange, recommendedBarWidthMm } from '@/lib/engines/baikfit/kbRules';

const SAVINGS_EN = `${KB_RULES.savingsCzk.min.toLocaleString('en-US')}–${KB_RULES.savingsCzk.max.toLocaleString('en-US')} CZK`;
const SAVINGS_CS = `${KB_RULES.savingsCzk.min.toLocaleString('cs-CZ')}–${KB_RULES.savingsCzk.max.toLocaleString('cs-CZ')} Kč`;

function barTrap(rider: RiderProfile, frame: StockFrame): Bilingual<FactoryComponentTrap> {
  const rec = recommendedBarWidthMm(rider.acromionWidthMm);
  return {
    en: {
      component: 'Handlebar / Cockpit Width',
      stockSpec: `${frame.barWidthMm}mm Factory Handlebar`,
      recommendedSpec: `${rec}mm Ergonomic Handlebar`,
      riskExplanation: `Factory ${frame.barWidthMm}mm bars exceed your acromion shoulder width (${rider.acromionWidthMm}mm). This causes internal wrist rotation, trapezius strain, and severe ulnar nerve compression (causing pinky and ring finger numbness).`,
      savingsNote: `A pre-purchase swap avoids roughly ${SAVINGS_EN} for an integrated cockpit replacement later.`,
    },
    cs: {
      component: 'Šířka řídítek / Kokpit',
      stockSpec: `${frame.barWidthMm} mm sériová řídítka`,
      recommendedSpec: `${rec} mm ergonomická řídítka`,
      riskExplanation: `Sériová ${frame.barWidthMm}mm řídítka jsou výrazně širší než šířka ramen v nadpažcích (${rider.acromionWidthMm} mm). Vynucují rotaci zápěstí dovnitř a utlačují ulnární nerv (příčina brnění malíčku a prsteníčku).`,
      savingsNote: `Výměna řídítek před expedicí kola ušetří zhruba ${SAVINGS_CS} za dodatečnou výměnu integrovaného kokpitu.`,
    },
  };
}

function crankTrap(rider: RiderProfile, frame: StockFrame): Bilingual<FactoryComponentTrap> {
  const rec = formatCrankRange();
  return {
    en: {
      component: 'Crankarm Length',
      stockSpec: `${frame.crankMm}mm Factory Cranks`,
      recommendedSpec: `${rec}mm Short Cranks`,
      riskExplanation: `Factory ${frame.crankMm}mm cranks pinch the hip angle at Top Dead Center (12 o'clock), compressing abdominal organs and loading the patellar tendon. Short cranks open the hip joint and relieve lower back tension.`,
      savingsNote: 'Specifying short cranks during pre-order avoids buying a new crankset and paying for its installation later.',
    },
    cs: {
      component: 'Délka klik',
      stockSpec: `${frame.crankMm} mm sériové kliky`,
      recommendedSpec: `${rec} mm krátké kliky`,
      riskExplanation: `Sériové ${frame.crankMm}mm kliky svírají v horní úvrati (12 hodin) příliš ostrý úhel v kyčli, stlačují břicho a přetěžují kolenní patelu. Kratší kliky otevřou kyčelní úhel a uleví bedrům.`,
      savingsNote: 'Požadavek na kratší kliky při objednávce ušetří nákup nové sady klik a servisní práci.',
    },
  };
}

export function buildTraps(rider: RiderProfile, frame: StockFrame): Bilingual<FactoryComponentTrap[]> {
  const bar = barTrap(rider, frame);
  const crank = crankTrap(rider, frame);
  return { en: [bar.en, crank.en], cs: [bar.cs, crank.cs] };
}

interface ChecklistValues {
  barWidthMm: number;
  recommendedBarMm: number;
  recommendedCrankMm: string;
  spacerDeltaMm: number;
}

function checklistEn(v: ChecklistValues): DealerChecklistItem[] {
  return [
    {
      action: 'Request Handlebar Width Swap Before Unboxing',
      detail: `Demand dealer swap factory ${v.barWidthMm}mm bars to ${v.recommendedBarMm}mm prior to bar tape installation. Most authorized retailers provide this at zero cost.`,
    },
    {
      action: 'Confirm Crankarm Length on Build Specification',
      detail: `Request groupset build specification with ${v.recommendedCrankMm}mm crankarms to prevent hip impingement before frame assembly.`,
    },
    {
      action: 'Retain Full Fork Steerer Length Uncut',
      detail: `Instruct dealer workshop NOT to cut the carbon fork steerer tube until dynamic bike fit verification with ${v.spacerDeltaMm}mm of spacers.`,
    },
    {
      action: 'Verify Saddle Width & Pressure Cutout',
      detail: 'Confirm factory saddle width is under 145mm with a full anatomical relief cutout to protect perineal blood flow.',
    },
  ];
}

function checklistCs(v: ChecklistValues): DealerChecklistItem[] {
  return [
    {
      action: 'Požadujte výměnu šířky řídítek před montáží',
      detail: `Požádejte prodejce o bezplatnou výměnu sériových ${v.barWidthMm}mm řídítek za ${v.recommendedBarMm} mm před namotáním omotávky. Autorizovaní prodejci to standardně umožňují zdarma.`,
    },
    {
      action: 'Ověřte délku klik v objednávce specifikace',
      detail: `Zadejte do konfigurace sady ${v.recommendedCrankMm} mm kliky pro otevření kyčelního úhlu a ochranu beder před sestavením kola.`,
    },
    {
      action: 'Požadujte nezkrácený krk vidlice',
      detail: `Výslovně instruujte servisní dílnu, aby nezkracovala sloupek karbonové vidlice před dynamickým fitováním s ${v.spacerDeltaMm} mm podložek.`,
    },
    {
      action: 'Zkontrolujte anatomický výřez sedla',
      detail: 'Ověřte, že sériové sedlo nepřesahuje šířku 145 mm a má plnohodnotný středový kanál pro ochranu měkkých tkání.',
    },
  ];
}

export function buildChecklist(
  rider: RiderProfile,
  frame: StockFrame,
  spacerDeltaMm: number
): Bilingual<DealerChecklistItem[]> {
  const values: ChecklistValues = {
    barWidthMm: frame.barWidthMm,
    recommendedBarMm: recommendedBarWidthMm(rider.acromionWidthMm),
    recommendedCrankMm: formatCrankRange(),
    spacerDeltaMm,
  };
  return { en: checklistEn(values), cs: checklistCs(values) };
}
