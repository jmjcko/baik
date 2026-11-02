/** The five jobs of the flat repair guide, in the order the rider meets them (product owner, 2026-10-30). */
export const FLAT_SCENARIOS = ['tube', 'patch', 'plug', 'sealant', 'tape'] as const;
export type FlatScenarioId = (typeof FLAT_SCENARIOS)[number];

/** The parts that the drawings of the flat repair guide name. */
export const FLAT_PART_IDS = ['tyre', 'rim', 'tape', 'holes', 'tube', 'valve', 'lever', 'hole', 'patch', 'plug', 'sealant', 'bottle', 'rough'] as const;
export type FlatPartId = (typeof FLAT_PART_IDS)[number];
