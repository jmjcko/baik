import type { GearCategory, GearCategoryId, GearGroupId, GearParam, GearParamId } from './gearTypes';
import { GEAR_CATEGORIES, GEAR_GROUPS } from './gearTypes';

/** How each question is answered and where its first value comes from. */
export const PARAMS: Record<GearParamId, GearParam> = {
  discipline: { kind: 'choice', prefill: 'discipline' },
  terrain: { kind: 'choice' },
  usage: { kind: 'choice' },
  budget: { kind: 'number' },
  currency: { kind: 'choice' },
  brands: { kind: 'text' },
  constraints: { kind: 'text' },
  rimWidth: { kind: 'number', unit: 'mm' },
  tyreWidth: { kind: 'number', unit: 'mm' },
  system: { kind: 'choice', prefill: 'tubeless' },
  priority: { kind: 'choice' },
  speeds: { kind: 'choice', prefill: 'speeds' },
  groupset: { kind: 'text' },
  chainWear: { kind: 'number', unit: '%', prefill: 'chainWear' },
  crankLength: { kind: 'number', unit: 'mm', prefill: 'crankLength' },
  powerMeter: { kind: 'choice' },
  rotorMount: { kind: 'choice' },
  rotorSize: { kind: 'choice' },
  padMaterial: { kind: 'choice' },
  caliper: { kind: 'text' },
  barWidth: { kind: 'number', unit: 'mm', prefill: 'barWidth' },
  saddleWidth: { kind: 'number', unit: 'mm' },
  saddleIssue: { kind: 'choice' },
  headUnit: { kind: 'choice' },
  seatpost: { kind: 'choice' },
  footWidth: { kind: 'choice' },
  shoeSize: { kind: 'number', unit: 'EU' },
  cleat: { kind: 'choice' },
};

const cat = (id: GearCategoryId, group: GearGroupId, params: readonly GearParamId[] = [], insights: GearCategory['insights'] = []): GearCategory => ({ id, group, params, insights });

/** All 30 categories: the ones with questions and rules from the knowledge bases (tyres, drivetrain, brakes, cockpit, saddles, cranks, radar, shoes) are covered in depth. */
export const TAXONOMY: Record<GearCategoryId, GearCategory> = {
  roadBike: cat('roadBike', 'bikes', [], ['sweetSpot', 'electronic']),
  gravelBike: cat('gravelBike', 'bikes', [], ['sweetSpot', 'electronic']),
  mtbHardtail: cat('mtbHardtail', 'bikes', [], ['sweetSpot']),
  mtbFull: cat('mtbFull', 'bikes', [], ['sweetSpot']),
  cassette: cat('cassette', 'components', ['speeds', 'groupset', 'chainWear'], ['chainWear', 'ospw']),
  chain: cat('chain', 'components', ['speeds', 'groupset', 'chainWear'], ['chainWear', 'ospw']),
  cranks: cat('cranks', 'components', ['crankLength', 'powerMeter', 'groupset'], ['crankLength', 'ceramic']),
  brakeRotors: cat('brakeRotors', 'components', ['rotorMount', 'rotorSize', 'caliper'], ['brakes']),
  brakePads: cat('brakePads', 'components', ['padMaterial', 'caliper'], ['brakes']),
  wheelset: cat('wheelset', 'components', [], ['deepWheels', 'ceramic']),
  tyres: cat('tyres', 'components', ['rimWidth', 'tyreWidth', 'system', 'priority'], ['roiTyres', 'pressure', 'tubeless']),
  handlebars: cat('handlebars', 'components', ['barWidth'], ['bars']),
  saddles: cat('saddles', 'components', ['saddleWidth', 'saddleIssue'], ['saddleWidth']),
  barTape: cat('barTape', 'components'),
  pedals: cat('pedals', 'components'),
  shoes: cat('shoes', 'apparel', ['footWidth', 'shoeSize', 'cleat'], ['shoes']),
  insoles: cat('insoles', 'apparel', [], ['shoes']),
  bibs: cat('bibs', 'apparel'),
  helmets: cat('helmets', 'apparel'),
  glasses: cat('glasses', 'apparel'),
  gloves: cat('gloves', 'apparel'),
  radar: cat('radar', 'electronics', ['headUnit', 'seatpost'], ['radar']),
  computer: cat('computer', 'electronics'),
  lights: cat('lights', 'electronics'),
  tracker: cat('tracker', 'electronics'),
  trainer: cat('trainer', 'electronics'),
  torqueWrench: cat('torqueWrench', 'tools'),
  chainGauge: cat('chainGauge', 'tools', [], ['chainWear']),
  bleedKit: cat('bleedKit', 'tools'),
  floorPump: cat('floorPump', 'tools'),
};

export const categoriesOf = (group: GearGroupId): GearCategory[] => GEAR_CATEGORIES.map((id) => TAXONOMY[id]).filter((one) => one.group === group);

/** The questions of a category in the order they are asked: its own first, then the general form (the discipline only for components, the terrain for bikes and components). */
export function paramsOf(id: GearCategoryId): GearParamId[] {
  const { group, params } = TAXONOMY[id];
  const shared: GearParamId[] = [];
  if (group === 'components') shared.push('discipline');
  if (group === 'components' || group === 'bikes') shared.push('terrain');
  shared.push('usage', 'budget', 'currency', 'brands', 'constraints');
  return [...params.filter((param) => !shared.includes(param)), ...shared];
}

export const isDeep = (id: GearCategoryId): boolean => TAXONOMY[id].params.length > 0;

export { GEAR_GROUPS };
