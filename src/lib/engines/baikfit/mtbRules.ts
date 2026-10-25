/**
 * MTB fitting rules (XC and Trail) taken from docs/knowledge/baikfit_kb_v1.4.0.md, section 11 and the Arm Pump row of section 6.
 * `MTB_RULE_SOURCES` links every constant to a phrase of the KB text and a test fails when that phrase disappears.
 * The effect of the sag on the geometry is an estimate (./estimates.ts).
 */

export const MTB_STYLES = ['xc', 'trail'] as const;
export type MtbStyle = (typeof MTB_STYLES)[number];

interface Range {
  min: number;
  max: number;
}

export const MTB_RULES = {
  sagTargetPercent: { xc: { min: 15, max: 20 }, trail: { min: 25, max: 30 } } as Record<MtbStyle, Range>,
  /** The sag that the app starts from (owner, 2026-10-25). */
  defaultSagPercent: { xc: 20, trail: 25 } as Record<MtbStyle, number>,
  /** Flat bar width = acromion width + this offset (owner, 2026-10-25). */
  barOffsetMm: { xc: 320, trail: 360 } as Record<MtbStyle, number>,
  barRangeMm: { xc: { min: 720, max: 760 }, trail: { min: 760, max: 800 } } as Record<MtbStyle, Range>,
  barMaxMm: 800,
  barRoundingMm: 10,
  stemRangeMm: { min: 35, max: 50 } as Range,
  /** For every `perBarMm` of extra bar width the stem is shortened by `shortenMm`. */
  stemPerBarWidth: { perBarMm: 20, shortenMm: 10 },
  backsweepDeg: { min: 7, max: 9 } as Range,
  upsweepDeg: { min: 4, max: 5 } as Range,
  dropperTravelMm: { min: 125, max: 210 } as Range,
  brakeLeverAngleDeg: { min: 40, max: 45 } as Range,
  armPumpForkSagPercent: { min: 20, max: 25 } as Range,
} as const;

export const MTB_RULE_SOURCES: Record<keyof typeof MTB_RULES, { section: string; phrase: string }> = {
  sagTargetPercent: { section: '11.1', phrase: 'XC **15%–20%** and Trail **25%–30%**' },
  defaultSagPercent: { section: '11.1', phrase: '**20% (XC)** and **25% (Trail)**' },
  barOffsetMm: { section: '11.2', phrase: '**acromion width + 320 mm** for XC and **acromion width + 360 mm** for Trail' },
  barRangeMm: { section: '11.2', phrase: '**720–760 mm** for XC and **760–800 mm** for Trail' },
  barMaxMm: { section: '11.2', phrase: 'A bar wider than 800 mm' },
  barRoundingMm: { section: '11.2', phrase: 'rounded to 10 mm' },
  stemRangeMm: { section: '11.2', phrase: 'short stems of **35–50 mm**' },
  stemPerBarWidth: { section: '11.2', phrase: 'For every **20 mm** of extra bar width, shorten the stem by about **10 mm**' },
  backsweepDeg: { section: '11.2', phrase: '**Backsweep 7°–9°**' },
  upsweepDeg: { section: '11.2', phrase: '**Upsweep 4°–5°**' },
  dropperTravelMm: { section: '11.3', phrase: '**125–210 mm** travel' },
  brakeLeverAngleDeg: { section: '6', phrase: 'Set the brake levers 40°–45° down' },
  armPumpForkSagPercent: { section: '6', phrase: 'Check the fork sag (20–25%)' },
};
