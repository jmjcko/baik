/** The five groups of what a rider can buy (Epic 41). Only human-powered sport bikes are in scope: no e-bikes and no city bikes (AGENTS.md). */
export const GEAR_GROUPS = ['bikes', 'components', 'apparel', 'electronics', 'tools'] as const;
export type GearGroupId = (typeof GEAR_GROUPS)[number];

export const GEAR_CATEGORIES = [
  'roadBike', 'gravelBike', 'mtbHardtail', 'mtbFull',
  'cassette', 'chain', 'cranks', 'brakeRotors', 'brakePads', 'wheelset', 'tyres', 'handlebars', 'saddles', 'barTape', 'pedals',
  'shoes', 'insoles', 'bibs', 'helmets', 'glasses', 'gloves',
  'radar', 'computer', 'lights', 'tracker', 'trainer',
  'torqueWrench', 'chainGauge', 'bleedKit', 'floorPump',
] as const;
export type GearCategoryId = (typeof GEAR_CATEGORIES)[number];

/** The questions that every category can ask (the general form) and the ones of the categories that the knowledge bases cover. */
export const GEAR_PARAMS = [
  'discipline', 'terrain', 'usage', 'budget', 'currency', 'brands', 'constraints',
  'rimWidth', 'tyreWidth', 'system', 'priority', 'speeds', 'groupset', 'chainWear', 'crankLength', 'powerMeter',
  'rotorMount', 'rotorSize', 'padMaterial', 'caliper', 'barWidth', 'saddleWidth', 'saddleIssue',
  'headUnit', 'seatpost', 'footWidth', 'shoeSize', 'cleat',
] as const;
export type GearParamId = (typeof GEAR_PARAMS)[number];

/** The choices of the questions that are answered by pressing a card. */
export const GEAR_OPTIONS = {
  discipline: ['road', 'gravel', 'mtb'],
  terrain: ['tarmac', 'mixed', 'offroad'],
  usage: ['race', 'training', 'endurance', 'everyday'],
  currency: ['czk', 'eur', 'gbp', 'usd'],
  system: ['tube', 'tubeless'],
  priority: ['speed', 'puncture', 'comfort', 'grip'],
  speeds: ['8-10', '11-12'],
  powerMeter: ['yes', 'no', 'either'],
  rotorMount: ['sixBolt', 'centerLock'],
  rotorSize: ['140', '160', '180', '203'],
  padMaterial: ['resin', 'metallic', 'either'],
  headUnit: ['garmin', 'wahoo', 'other', 'none'],
  seatpost: ['round', 'aero', 'unknown'],
  saddleIssue: ['none', 'numbness', 'soreness'],
  footWidth: ['narrow', 'standard', 'wide'],
  cleat: ['spd', 'look', 'other'],
} as const;
export type ChoiceParamId = keyof typeof GEAR_OPTIONS;

/** What of the garage bike or of the rider can fill a question in before the rider does. */
export type GearPrefill = 'discipline' | 'tubeless' | 'speeds' | 'chainWear' | 'crankLength' | 'barWidth';

export interface GearParam {
  kind: 'choice' | 'number' | 'text';
  unit?: string;
  prefill?: GearPrefill;
}

/** The knowledge-base rules that are shown before the prompt is made (High-ROI insight, step 3). */
export const GEAR_INSIGHTS = [
  'roiTyres', 'pressure', 'tubeless', 'ceramic', 'ospw', 'chainWear', 'electronic', 'bars', 'crankLength',
  'saddleWidth', 'brakes', 'radar', 'shoes', 'deepWheels', 'sweetSpot',
] as const;
export type GearInsightId = (typeof GEAR_INSIGHTS)[number];

export interface GearCategory {
  id: GearCategoryId;
  group: GearGroupId;
  /** The questions this category adds to the general form; empty for a category the knowledge bases do not cover in depth. */
  params: readonly GearParamId[];
  insights: readonly GearInsightId[];
}

/** One answer of the rider; `fromGarage` marks a value that came from the garage bike and was not changed. */
export interface GearAnswer {
  value: string | number;
  fromGarage: boolean;
}

export type GearAnswers = Partial<Record<GearParamId, GearAnswer>>;
