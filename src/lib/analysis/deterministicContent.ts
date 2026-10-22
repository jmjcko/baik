import type { AlternativeBikeRecommendation, BiomechanicalPoint } from '@/types/baikfit';

export interface Bilingual<T> {
  en: T;
  cs: T;
}

const PROS_EN: BiomechanicalPoint[] = [
  {
    title: 'Seat tube angle matches saddle setback',
    detail: `The frame's 73.5° seat tube angle supports your target setback without requiring an extreme offset seatpost, keeping your center of mass balanced over the BB.`,
  },
  {
    title: 'Optimal Bottom Bracket drop for pelvic stability',
    detail: 'Standard 70mm BB drop ensures balanced center of gravity and stable pedaling cadence during cornering and steady endurance efforts.',
  },
  {
    title: 'Pedal stance width compatibility',
    detail: 'BB shell and chainstay profile accommodate your recommended Q-factor and cleat stance width without medial ankle bone contact.',
  },
];

const PROS_CS: BiomechanicalPoint[] = [
  {
    title: 'Sedlový úhel odpovídá požadovanému offsetu',
    detail: 'Úhel sedlové trubky 73,5° umožňuje optimální předozadní pozici sedla vůči ose středu BB (0,0) bez nutnosti sedlovky s extrémním vyosením.',
  },
  {
    title: 'Ideální pokles středu pro stabilitu pánve',
    detail: 'Standardní pokles středu 70 mm zajišťuje nízké těžiště a stabilní kadenci šlapání v zatáčkách i při vytrvalostní jízdě po rovině.',
  },
  {
    title: 'Kompatibilita s doporučeným Q-faktorem',
    detail: 'Konstrukce zadní stavby umožňuje nastavení přirozeného rozkročení chodidel (Q-faktoru) bez kontaktu kotníků s klikami.',
  },
];

export function buildPros(): Bilingual<BiomechanicalPoint[]> {
  return { en: PROS_EN, cs: PROS_CS };
}

export interface ConsContext {
  stockStackMm: number;
  recommendedStackMm: number;
  spacerDeltaMm: number;
  stockReachMm: number;
  stemDeltaMm: number;
}

function signed(value: number): string {
  return value > 0 ? `+${value}` : `${value}`;
}

export function buildCons(ctx: ConsContext): Bilingual<BiomechanicalPoint[]> {
  const delta = signed(ctx.stemDeltaMm);
  return {
    en: [
      {
        title: 'Aggressive Stack Height Compromise',
        detail: `Factory frame stack of ${ctx.stockStackMm}mm is lower than your recommended stack (${ctx.recommendedStackMm}mm), requiring ${ctx.spacerDeltaMm}mm of headset spacers under the stem which reduces steering precision.`,
      },
      {
        title: 'Cockpit Reach Overextension Risk',
        detail: `Frame reach (${ctx.stockReachMm}mm) combined with factory stem creates reach deviation of ${delta}mm, which risks thoracic spine slump and excessive shoulder loading.`,
      },
    ],
    cs: [
      {
        title: 'Nízký rámový Stack vyžaduje kompromis',
        detail: `Sériový Stack rámu (${ctx.stockStackMm} mm) je nižší než váš doporučený (${ctx.recommendedStackMm} mm), což si vyžádá ${ctx.spacerDeltaMm} mm podložek pod představcem a mírně snižuje tuhost řízení.`,
      },
      {
        title: 'Riziko přetížení paží a ramen délkou Reach',
        detail: `Rámový Reach (${ctx.stockReachMm} mm) v kombinaci se sériovým představcem vytváří odchylku ${delta} mm, což může vést k propadání hrudníku a únavě šíje.`,
      },
    ],
  };
}

const ALTERNATIVES_EN: AlternativeBikeRecommendation[] = [
  {
    modelName: 'Canyon Endurace CF 8',
    reasonWhyBetter: 'Taller front-end stack (+22mm) and shorter reach allows your ideal 65° endurance torso angle without excessive spacer stacks under the stem.',
    stackReachComparison: 'Stack: 586mm / Reach: 378mm (STR: 1.55 vs 1.48 candidate)',
  },
  {
    modelName: 'Specialized Roubaix SL8',
    reasonWhyBetter: 'Future Shock cockpit suspension with upright endurance geometry protects wrists and ulnar nerve while providing relaxed reach.',
    stackReachComparison: 'Stack: 592mm / Reach: 372mm (STR: 1.59 vs 1.48 candidate)',
  },
  {
    modelName: 'Trek Domane SL 6 Gen 4',
    reasonWhyBetter: 'Generous headtube stack and rear IsoSpeed decoupler isolate lower back fatigue, keeping lumbar spine relaxed on long rides.',
    stackReachComparison: 'Stack: 591mm / Reach: 374mm (STR: 1.58 vs 1.48 candidate)',
  },
];

const ALTERNATIVES_CS: AlternativeBikeRecommendation[] = [
  {
    modelName: 'Canyon Endurace CF 8',
    reasonWhyBetter: 'Vyšší Stack (+22 mm) a kratší Reach umožňují dosáhnout ideálního úhlu trupu 65° bez nutnosti kompromisní věže podložek pod představcem.',
    stackReachComparison: 'Stack: 586 mm / Reach: 378 mm (STR: 1,55 oproti 1,48 zvažovaného)',
  },
  {
    modelName: 'Specialized Roubaix SL8',
    reasonWhyBetter: 'Odpružení představce Future Shock a vytrvalostní geometrie chrání ulnární nerv v dlaních a poskytují přirozený dosah bez přepětí.',
    stackReachComparison: 'Stack: 592 mm / Reach: 372 mm (STR: 1,59 oproti 1,48 zvažovaného)',
  },
  {
    modelName: 'Trek Domane SL 6 Gen 4',
    reasonWhyBetter: 'Štědrý Stack hlavové trubky a prvek IsoSpeed výrazně omezují únavu beder a eliminují tah hamstringů při dlouhých vyjížďkách.',
    stackReachComparison: 'Stack: 591 mm / Reach: 374 mm (STR: 1,58 oproti 1,48 zvažovaného)',
  },
];

export function buildAlternatives(): Bilingual<AlternativeBikeRecommendation[]> {
  return { en: ALTERNATIVES_EN, cs: ALTERNATIVES_CS };
}
