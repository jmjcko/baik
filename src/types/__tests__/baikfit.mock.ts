/**
 * Unit Test Mocks & Fixtures for bAIkfit TypeScript Interfaces & Contracts
 * 
 * 3Pillar AIRE SDLC Agentic Framework
 */

import {
  RiderProfile,
  BikeFitCoordinates,
  PrePurchaseAnalysisRequest,
  PrePurchaseAnalysisResponse,
} from '../baikfit';

/**
 * Mock 1: Endurance Rider Profile with Hand Numbness
 */
export const mockRiderProfileEndurance: RiderProfile = {
  inseamMm: 840,
  heightCm: 180,
  torsoLengthMm: 620,
  armLengthMm: 640,
  acromionWidthMm: 390,
  riderWeightKg: 78,
  flexibilityScore: 'moderate',
  ridingStyle: 'endurance',
  currentPains: ['numb_hands', 'lower_back'],
};

/**
 * Mock 2: Aggressive Race Rider Profile with Knee Pain
 */
export const mockRiderProfileRace: RiderProfile = {
  inseamMm: 885,
  heightCm: 188,
  torsoLengthMm: 640,
  armLengthMm: 680,
  acromionWidthMm: 380,
  riderWeightKg: 72,
  flexibilityScore: 'flexible',
  ridingStyle: 'race',
  currentPains: ['back_knee'],
};

/**
 * Mock 3: Heavy / Morphologically Specific Rider with Hip Impingement
 */
export const mockRiderProfileHeavy: RiderProfile = {
  inseamMm: 790,
  heightCm: 175,
  torsoLengthMm: 600,
  armLengthMm: 610,
  acromionWidthMm: 440,
  riderWeightKg: 96,
  flexibilityScore: 'inflexible',
  ridingStyle: 'endurance',
  currentPains: ['front_knee', 'saddle_sores'],
};

/**
 * Mock 4: Standard Universal BikeFitCoordinates (XY Datum System)
 */
export const mockBikeFitCoordinates: BikeFitCoordinates = {
  datum: [0, 0],
  saddle: {
    heightAlongTubeMm: 742,
    verticalYMm: 711,
    setbackXMm: -210,
    measurementPointNote: '70mm width mark on top surface of saddle',
  },
  cockpit: {
    reachXMm: 384,
    stackYMm: 567,
  },
};

/**
 * Mock 5: Pre-Purchase Analysis Request
 */
export const mockPrePurchaseRequest: PrePurchaseAnalysisRequest = {
  bikeModelName: 'Canyon Endurace CF 7 Disc',
  geometry: {
    source: 'catalog',
    sizes: [
      { size: 'M', spec: { frameStackMm: 568, frameReachMm: 378, seatTubeAngleDeg: 73.5, stockStemMm: 100, stockHandlebarMm: 420, stockCrankMm: 172.5, stockSeatpostOffsetMm: null, stockSpacersMm: null } },
      { size: 'L', spec: { frameStackMm: 590, frameReachMm: 387, seatTubeAngleDeg: 73.5, stockStemMm: 100, stockHandlebarMm: 420, stockCrankMm: 172.5, stockSeatpostOffsetMm: null, stockSpacersMm: null } },
    ],
  },
  riderProfile: mockRiderProfileEndurance,
};

/**
 * Mock 6: Pre-Purchase Analysis Response (Gemini API Contract)
 */
export const mockPrePurchaseResponse: PrePurchaseAnalysisResponse = {
  fitMatchScore: 94,
  recommendedFrameSize: 'M (Medium)',
  stackMatch: {
    recommendedStackMm: 585,
    stockStackMm: 568,
    spacerDeltaMm: 17,
  },
  reachMatch: {
    recommendedReachMm: 375,
    stockReachMm: 378,
    stemDeltaMm: 0,
  },
  componentMismatchAlerts: [
    {
      component: 'handlebar',
      stockSpec: '420mm Factory Handlebar',
      recommendedSpec: '380mm or 400mm Handlebar',
      reasoningEn:
        'Factory 420mm handlebar exceeds your 390mm acromion shoulder width by 30mm. This causes internal wrist rotation, triceps fatigue, and compressive ulnar neuropathy (numb hands).',
      reasoningCs:
        'Sériová 420mm řídítka přesahují šířku vašich ramen (390 mm) o 30 mm. To způsobuje rotaci zápěstí dovnitř, přetížení tricepsů a kompresi ulnárního nervu (brnění prstů).',
      financialSavingsNoteEn:
        'Request an exchange to 380mm or 400mm bars before delivery or shop unboxing; most authorized dealers will swap at zero cost before wrapping bar tape, saving you ~£75 / 2,200 CZK.',
      financialSavingsNoteCs:
        'Požádejte prodejce o výměnu za 380mm či 400mm řídítka před montáží a omotáním pásky. Většina dealerů provede výměnu bezplatně, což vám ušetří cca 2 200 Kč.',
    },
    {
      component: 'crank',
      stockSpec: '172.5mm Factory Cranks',
      recommendedSpec: '165mm or 170mm Cranks',
      reasoningEn:
        'For an 840mm inseam with reported lower back fatigue, 172.5mm cranks cause acute hip angle closure at Top Dead Center (TDC). Shortening to 165mm opens the hip angle and relieves lumbar strain.',
      reasoningCs:
        'Při vnitřní délce nohou 840 mm a stížnostech na bederní páteř vedou 172,5mm kliky k ostrému úhlu v kyčli v horní úvrati (TDC). Zkrácení na 165 mm otevře úhel kyčle a uleví bedrům.',
      financialSavingsNoteEn:
        'Ask the retailer if the groupset build allows selecting 165mm crankarms upon order placement.',
      financialSavingsNoteCs:
        'Ověřte u prodejce, zda konfigurátor umožňuje volbu 165mm klik přímo do výroby.',
    },
  ],
  overallSummaryEn:
    'The Canyon Endurace CF 7 in Size M is an excellent geometric match (94% fit confidence). Stack and reach targets can be achieved with 15-20mm of standard spacers. However, request a narrower handlebar swap prior to purchase to resolve your reported hand numbness.',
  overallSummaryCs:
    'Canyon Endurace CF 7 ve velikosti M představuje vynikající geometrickou shodu (94% shoda rámu). Požadovaný stack a reach lze snadno nastavit pomocí 15–20 mm standardních podložek. Důrazně však doporučujeme před dodáním vyměnit sériová řídítka za užší pro odstranění brnění rukou.',
  biomechanicalProsEn: [
    {
      title: 'Optimal Effective Top Tube Length',
      detail: 'Horizontal reach aligns within 4mm of neutral upper-body extension target.',
    },
    {
      title: 'Stable Head Tube Angle',
      detail: '72.5° head tube angle provides steady tracking and minimizes shoulder girdle tension.',
    },
  ],
  biomechanicalProsCs: [
    {
      title: 'Optimální délka horní rámové trubky',
      detail: 'Horizontální dosah rámu odpovídá cílové poloze těla s odchylkou do 4 mm.',
    },
    {
      title: 'Předvídatelný úhel hlavové trubky',
      detail: '72,5° úhel zajišťuje stabilní vedení stopy a šetří trapézové svaly.',
    },
  ],
  biomechanicalConsEn: [
    {
      title: 'Aggressive Factory Stack',
      detail: 'Factory head tube requires 25mm of headset spacers for endurance riding posture.',
    },
  ],
  biomechanicalConsCs: [
    {
      title: 'Nižší sériový Stack rámu',
      detail: 'Rám vyžaduje použití 25 mm podložek pod představcem pro vytrvalostní posed.',
    },
  ],
  factoryComponentTrapsEn: [
    {
      component: 'Factory Cockpit Width',
      stockSpec: '420mm Drop Bar',
      recommendedSpec: '380mm Drop Bar',
      riskExplanation:
        'Factory 420mm bar forces internal shoulder rotation and compression of the ulnar nerve.',
      savingsNote: 'Request exchange prior to dispatch. Saves approx. 2,200 CZK.',
    },
    {
      component: 'Factory Crankset',
      stockSpec: '172.5mm Crankarms',
      recommendedSpec: '165mm Crankarms',
      riskExplanation:
        'Long cranks cause acute hip impingement at top dead center.',
      savingsNote: 'Selecting 165mm cranks during ordering saves approx. 4,500 CZK.',
    },
  ],
  factoryComponentTrapsCs: [
    {
      component: 'Sériová šířka řídítek',
      stockSpec: '420mm řídítka',
      recommendedSpec: '380mm řídítka',
      riskExplanation:
        'Sériová 420mm řídítka nutí ramena do vnitřní rotace a stlačují ulnární nerv.',
      savingsNote: 'Požádejte o výměnu před dodáním. Ušetříte cca 2 200 Kč.',
    },
    {
      component: 'Sériové kliky',
      stockSpec: '172,5mm kliky',
      recommendedSpec: '165mm kliky',
      riskExplanation:
        'Příliš dlouhé kliky způsobují svírání kyčle v horní úvrati šlapání.',
      savingsNote: 'Výběr 165mm klik v objednávce ušetří cca 4 500 Kč.',
    },
  ],
  alternativeBikesEn: [
    {
      modelName: 'Canyon Endurace CF 7',
      reasonWhyBetter: 'Taller stack height and relaxed reach reduce neck strain.',
      stackReachComparison: 'Stack 585mm (+18mm), Reach 375mm (-3mm)',
    },
  ],
  alternativeBikesCs: [
    {
      modelName: 'Canyon Endurace CF 7',
      reasonWhyBetter: 'Vyšší stack a kratší reach zásadně snižují přetížení šíje.',
      stackReachComparison: 'Stack 585 mm (+18 mm), Reach 375 mm (-3 mm)',
    },
  ],
  dealerChecklistEn: [
    {
      action: 'Handlebar Width Exchange',
      detail: 'Swap factory 420mm bar for 380mm bar before taping.',
    },
  ],
  dealerChecklistCs: [
    {
      action: 'Výměna šířky řídítek',
      detail: 'Vyměnit sériová 420mm řídítka za 380mm před omotáním.',
    },
  ],
};
