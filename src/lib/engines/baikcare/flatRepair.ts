/** The five jobs of the flat repair guide, in the order the rider meets them (product owner, 2026-10-30). */
export const FLAT_SCENARIOS = ['tube', 'patch', 'plug', 'sealant', 'tape'] as const;
export type FlatScenarioId = (typeof FLAT_SCENARIOS)[number];
