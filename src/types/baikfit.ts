/**
 * bAIkfit Engine — TypeScript Domain Types & Gemini API Contracts
 * 
 * 3Pillar AIRE SDLC Agentic Framework
 * Standards: CodeGuard, OWASP, Google Material Design 3
 * Bilingual: English (en) & Czech (cs)
 */

// ============================================================================
// 1. RIDER PROFILE & MEASUREMENTS
// ============================================================================

export type FlexibilityScore = 'inflexible' | 'moderate' | 'flexible';

export type RidingStyle = 'endurance' | 'balanced' | 'race';

/** Symptoms the rider can report; each maps to a row of the master KB diagnostic decision tree (KB 6). */
export const RIDER_PAIN_TYPES = [
  'numb_hands',
  'front_knee',
  'back_knee',
  'lower_back',
  'neck_pain',
  'saddle_sores',
] as const;

export type RiderPainType = (typeof RIDER_PAIN_TYPES)[number];

export interface RiderProfile {
  /** Measured crotch to floor in bare feet / socks (mm) */
  inseamMm: number;
  /** Total standing height (cm) */
  heightCm: number;
  /** Torso length measured from sternal notch to pubic symphysis (mm) */
  torsoLengthMm: number;
  /** Arm length measured from acromion process to center of clenched fist (mm) */
  armLengthMm: number;
  /** Structural bony shoulder width measured between acromion processes (mm) */
  acromionWidthMm: number;
  /** Rider body mass (kg) */
  riderWeightKg: number;
  /** Current bike setup entered by the rider (optional; used for bike selection and fitting proposals) */
  currentCrankLengthMm?: number;
  currentSaddleHeightMm?: number | null;
  currentBarWidthMm?: number | null;
  /** Hamstring and lower lumbar flexibility evaluation */
  flexibilityScore: FlexibilityScore;
  /** Primary intended riding posture and aerodynamic target */
  ridingStyle: RidingStyle;
  /** Acute biomechanical pain symptoms reported by the rider */
  currentPains: RiderPainType[];
}

// ============================================================================
// 2. BIKE FIT COORDINATES (XY DATUM SYSTEM) — single source of truth
// ============================================================================

/** Riding disciplines; the discipline sets the baseline geometry rules (drop bars or flat bars). */
export const RIDING_DISCIPLINES = ['road', 'gravel', 'xc_mtb', 'trekking'] as const;

export type RidingDiscipline = (typeof RIDING_DISCIPLINES)[number];

export interface BikeFitCoordinates {
  /** Universal Origin Datum: Center of the Bottom Bracket Shell [0, 0] */
  datum: [number, number];
  saddle: {
    /** Physical saddle height in mm from BB center along the seat tube axis to the 70mm width mark (LeMond, KB 2.1) */
    heightAlongTubeMm: number;
    /** Saddle Y in mm: vertical projection of the along-tube height (KB 1.1); used by the 2D wireframe only */
    verticalYMm: number;
    /** Saddle setback (X) in mm behind BB center (negative) */
    setbackXMm: number;
    measurementPointNote: string;
  };
  cockpit: {
    /** Cockpit reach (X) in mm from BB center to handlebar center */
    reachXMm: number;
    /** Cockpit stack (Y) in mm from BB center to handlebar center */
    stackYMm: number;
  };
}

/** Complete persisted rider profile (every measurement the app collects). */
export interface SavedRiderProfile {
  savedAt: string;
  inseamMm: number;
  torsoLengthMm: number;
  armLengthMm: number;
  acromionWidthMm: number;
  heightCm: number;
  crankLengthMm: number;
  riderWeightKg: number;
  /** Rider's current bike: saddle height from the BB center (mm) and handlebar width c-c (mm); null = not entered */
  currentSaddleHeightMm: number | null;
  currentBarWidthMm: number | null;
  discipline: RidingDiscipline;
  ridingStyle: RidingStyle;
  currentPains: RiderPainType[];
  coordinates: BikeFitCoordinates;
}

// ============================================================================
// 3. PRE-PURCHASE ANALYSIS REQUEST & RESPONSE (GEMINI API INTEGRATION)
// ============================================================================

export interface PrePurchaseAnalysisRequest {
  /** Commercial bicycle model name (e.g. "Canyon Endurace CF 7 Size M") */
  bikeModelName: string;
  /** Optional e-commerce or manufacturer product page URL for live extraction */
  shopUrl?: string;
  /** Complete rider biomechanical profile and measurements */
  riderProfile: RiderProfile;
  /** UI locale; selects the language of the KB-grounded AI prompt (default 'en') */
  locale?: 'en' | 'cs';
}

export type MismatchComponentType = 'handlebar' | 'crank' | 'saddle' | 'stem';

export interface ComponentMismatchAlert {
  /** The factory component with a detected biomechanical mismatch */
  component: MismatchComponentType;
  /** Stock specification provided from the factory (e.g. "420mm bar", "172.5mm cranks") */
  stockSpec: string;
  /** Ergonomically recommended specification based on rider anatomy (e.g. "380mm bar") */
  recommendedSpec: string;
  /** Clinical and biomechanical explanation in English */
  reasoningEn: string;
  /** Clinical and biomechanical explanation in Czech */
  reasoningCs: string;
  /** Guidance on negotiating a free factory/shop swap prior to delivery in English */
  financialSavingsNoteEn: string;
  /** Guidance on negotiating a free factory/shop swap prior to delivery in Czech */
  financialSavingsNoteCs: string;
}

export interface StackMatchResult {
  /** Biomechanically recommended cockpit stack height from BB in mm */
  recommendedStackMm: number;
  /** Factory frame stack height in mm */
  stockStackMm: number;
  /** Required spacer stack delta in mm under stem (positive = spacers needed, negative = too high) */
  spacerDeltaMm: number;
}

export interface ReachMatchResult {
  /** Biomechanically recommended cockpit reach distance from BB in mm */
  recommendedReachMm: number;
  /** Factory frame reach distance in mm */
  stockReachMm: number;
  /** Stem length delta required in mm to achieve target reach */
  stemDeltaMm: number;
}

export interface BiomechanicalPoint {
  /** Short punchy title (e.g. "Sedlový úhel odpovídá požadovanému offsetu") */
  title: string;
  /** In-depth biomechanical explanation and rationale */
  detail: string;
}

export interface FactoryComponentTrap {
  /** Name of the component (e.g. "Handlebar / Cockpit", "Crankarms") */
  component: string;
  /** Stock specification provided on factory bike (e.g. "420mm Integrated Cockpit") */
  stockSpec: string;
  /** Ergonomically recommended specification based on rider biomechanics (e.g. "380mm Ergonomic Bar") */
  recommendedSpec: string;
  /** Clinical explanation of injury risk or ergonomic penalty */
  riskExplanation: string;
  /** Financial guidance and pre-purchase savings estimate (e.g. "~10 000 Kč / ~€400") */
  savingsNote: string;
}

export interface AlternativeBikeRecommendation {
  /** Recommended commercial bike model name (e.g. "Canyon Endurace CF 8") */
  modelName: string;
  /** Reason why this geometry better suits the rider's posture and morphology */
  reasonWhyBetter: string;
  /** Stack/Reach comparison note (e.g. "+25mm Stack / -10mm Reach creates relaxed 65° torso") */
  stackReachComparison: string;
}

export interface DealerChecklistItem {
  /** Action item to request before purchase (e.g. "Změna šířky řídítek před montáží") */
  action: string;
  /** Concrete specification or instruction for dealer */
  detail: string;
}

export interface PrePurchaseAnalysisResponse {
  /** Overall biomechanical fit match score (0 - 100) */
  fitMatchScore: number;
  /** Recommended commercial frame size designation (e.g. "M / 54cm") */
  recommendedFrameSize: string;
  /** Stack alignment and spacer calculation results */
  stackMatch: StackMatchResult;
  /** Reach alignment and stem adjustment results */
  reachMatch: ReachMatchResult;
  /** List of detected stock component mismatches with pre-delivery swap recommendations */
  componentMismatchAlerts: ComponentMismatchAlert[];
  /** High-level executive fit assessment and recommendation in English */
  overallSummaryEn: string;
  /** High-level executive fit assessment and recommendation in Czech */
  overallSummaryCs: string;
  /** Biomechanical pros of the frame geometry for this rider in English */
  biomechanicalProsEn: BiomechanicalPoint[];
  /** Biomechanical pros of the frame geometry for this rider in Czech */
  biomechanicalProsCs: BiomechanicalPoint[];
  /** Biomechanical cons and geometry compromises for this rider in English */
  biomechanicalConsEn: BiomechanicalPoint[];
  /** Biomechanical cons and geometry compromises for this rider in Czech */
  biomechanicalConsCs: BiomechanicalPoint[];
  /** Critical factory component traps with financial savings alerts in English */
  factoryComponentTrapsEn: FactoryComponentTrap[];
  /** Critical factory component traps with financial savings alerts in Czech */
  factoryComponentTrapsCs: FactoryComponentTrap[];
  /** Geometrically superior alternative bike suggestions in English */
  alternativeBikesEn: AlternativeBikeRecommendation[];
  /** Geometrically superior alternative bike suggestions in Czech */
  alternativeBikesCs: AlternativeBikeRecommendation[];
  /** Actionable dealer/brand order checklist items in English */
  dealerChecklistEn: DealerChecklistItem[];
  /** Actionable dealer/brand order checklist items in Czech */
  dealerChecklistCs: DealerChecklistItem[];
}

// ============================================================================
// 4. BILINGUAL DOMAIN LABELS & TRANSLATION DICTIONARIES
// ============================================================================

export interface BaikfitDomainTranslations {
  flexibility: Record<FlexibilityScore, { en: string; cs: string }>;
  ridingStyle: Record<RidingStyle, { en: string; cs: string }>;
  pains: Record<RiderPainType, { en: string; cs: string }>;
  components: Record<MismatchComponentType, { en: string; cs: string }>;
}

export const BAIKFIT_DOMAIN_TRANSLATIONS: BaikfitDomainTranslations = {
  flexibility: {
    inflexible: {
      en: 'Inflexible (Restricted Hamstrings / Lumbar)',
      cs: 'Méně ohebný (Zkrácené hamstringy a bedra)',
    },
    moderate: {
      en: 'Moderate (Standard Athletic Mobility)',
      cs: 'Střední (Běžná atletická flexibilita)',
    },
    flexible: {
      en: 'Flexible (High Pelvic Rotation Capacity)',
      cs: 'Velmi ohebný (Vysoká rotace pánve / hluboký předklon)',
    },
  },
  ridingStyle: {
    endurance: {
      en: 'Endurance & Comfort (65°–80° Torso Angle)',
      cs: 'Vytrvalost & Pohodlí (Úhel trupu 65°–80°)',
    },
    balanced: {
      en: 'Balanced Sport (55°–65° Torso Angle)',
      cs: 'Vyvážený sportovní (Úhel trupu 55°–65°)',
    },
    race: {
      en: 'Race & Aero Performance (45°–55° Torso Angle)',
      cs: 'Závodní & Aerodynamický (Úhel trupu 45°–55°)',
    },
  },
  pains: {
    numb_hands: {
      en: 'Hand Numbness & Wrist Tingle (Ulnar Compression)',
      cs: 'Brnění rukou a prstů (Útlak ulnárního nervu)',
    },
    front_knee: {
      en: 'Anterior Knee Pain (Patellar Overload)',
      cs: 'Bolest přední části kolene (Přetížení pately)',
    },
    back_knee: {
      en: 'Posterior Knee Pain (Hamstring Hyperextension)',
      cs: 'Tah a bolest pod kolenem (Přetažení hamstringů)',
    },
    lower_back: {
      en: 'Lower Back & Lumbar Fatigue',
      cs: 'Bolest a tuhnutí bederní páteře',
    },
    neck_pain: {
      en: 'Neck & Trapezius Pain',
      cs: 'Bolest krku a trapézových svalů',
    },
    saddle_sores: {
      en: 'Saddle Sores & Perineal Pressure',
      cs: 'Otlačeniny a tlak na měkké sedací tkáně',
    },
  },
  components: {
    handlebar: {
      en: 'Handlebar Width',
      cs: 'Šířka řídítek',
    },
    crank: {
      en: 'Crank Length',
      cs: 'Délka klik',
    },
    saddle: {
      en: 'Saddle Profile',
      cs: 'Typ a šířka sedla',
    },
    stem: {
      en: 'Stem Length & Angle',
      cs: 'Délka a sklon představce',
    },
  },
};
