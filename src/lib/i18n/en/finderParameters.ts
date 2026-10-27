import type { FinderParameterTexts } from '../types/finder';

/** The questions of the bike finder (the order and the options are in `lib/finder/parameters.ts`). */
export const finderParameters: FinderParameterTexts = {
  road_type: { name: 'What is the bike for', why: 'It sets the whole character of the frame: relaxed and stable, or low and fast.', options: { endurance: 'Long comfortable rides (endurance)', allround: 'A bit of everything (all-round)', race: 'Fast and racing (race)', aero: 'Maximum speed on flat roads (aero)' } },
  gravel_use: { name: 'What is the bike for', why: 'A fast gravel racer and a loaded adventure bike are built very differently.', options: { fast: 'Fast rides and gravel races', adventure: 'Adventure and bikepacking with luggage', mixed: 'Mixed use: road, gravel and daily rides' } },
  mtb_type: { name: 'What is the bike for', why: 'It decides the travel, the head angle and how upright you sit.', options: { xc_race: 'Cross-country racing (XC)', marathon: 'Long marathon rides', trail: 'Trail riding and descents' } },
  suspension: { name: 'Suspension', why: 'A hardtail is lighter and cheaper, a full suspension is more comfortable and faster on rough ground.', options: { hardtail: 'Hardtail (front fork only)', full: 'Full suspension', either: 'Either, advise me' } },
  wheel_size: { name: 'Wheel size', why: 'It changes how the bike rolls and how it fits a smaller or taller rider.', options: { w29: '29 inch', w275: '27.5 inch', mullet: 'Mullet (29 front, 27.5 rear)', any: 'No preference' } },
  shifting: { name: 'Shifting', why: 'Electronic shifting is precise and needs no adjusting, mechanical is simpler and cheaper to service.', options: { mechanical: 'Mechanical (cable)', electronic: 'Electronic (Di2, AXS)', any: 'No preference' } },
  groupset_brand: { name: 'Groupset brand', why: 'The two big makers differ in feel and in spare parts; a bike is usually built around one of them.', options: { shimano: 'Shimano', sram: 'SRAM', any: 'No preference' } },
  drivetrain: { name: 'Drivetrain layout', why: 'One chainring is simpler and quieter, two give a finer choice of gears.', options: { one_by: 'One chainring (1x)', two_by: 'Two chainrings (2x)', any: 'No preference' } },
  brakes: { name: 'Brakes', why: 'Hydraulic disc brakes brake best and need little force; mechanical ones are easier to fix on the road.', options: { hydraulic_disc: 'Hydraulic disc', mechanical_disc: 'Mechanical disc', any: 'No preference' } },
  material: { name: 'Frame material', why: 'Carbon is light and damps vibration, aluminium is the best value, steel and titanium last longest.', options: { carbon: 'Carbon', aluminium: 'Aluminium', steel_titanium: 'Steel or titanium', any: 'No preference' } },
  wheels: { name: 'Wheels', why: 'Deeper carbon rims are faster and stiffer but heavier in a crosswind and dearer.', options: { alloy: 'Aluminium rims', carbon_mid: 'Carbon, medium depth', carbon_deep: 'Carbon, deep (aero)', any: 'No preference' } },
  tyres_road: { name: 'Tyre width that fits', why: 'Wider tyres on a lower pressure give comfort and grip on bad roads.', options: { up_to_28: 'Up to 28 mm', c30_32: '30 to 32 mm', c35_plus: '35 mm and wider' } },
  tyres_gravel: { name: 'Tyre width that fits', why: 'Wider tyres give grip and comfort on loose ground, narrower ones roll faster.', options: { c40: 'Up to 40 mm', c45: 'Up to 45 mm', c50_plus: '50 mm and wider' } },
  mounts: { name: 'Mounting points', why: 'Bags, mudguards and racks need threaded mounts on the frame and fork.', options: { bags: 'Frame and top tube bags', fenders: 'Mudguards', rack: 'Racks', none: 'None needed' } },
  dropper: { name: 'Dropper seatpost', why: 'A dropper post lowers the saddle on descents; it matters most on a trail bike.', options: { yes: 'Yes, it must have one', no: 'No', any: 'No preference' } },
  budget: { name: 'Budget', why: 'It decides the level of the parts; the frame size does not depend on it.', options: { entry: 'Up to 1,500 EUR', mid: '1,500 to 3,000 EUR', high: '3,000 to 5,000 EUR', top: 'Over 5,000 EUR', open: 'No limit' } },
  colour: { name: 'Colour', why: 'Only a wish; it never changes the size or the fit verdict.', options: {} },
  brands_preferred: { name: 'Brands you like', why: 'Brands you trust or want to see first, separated by commas.', options: {} },
  brands_excluded: { name: 'Brands to leave out', why: 'Brands that must not be suggested, separated by commas.', options: {} },
};
