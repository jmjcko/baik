import { describe, it, expect } from 'vitest';
import { translations } from '@/lib/i18n/translations';
import { DEFAULT_PROFILE, type ProfileValues } from '@/lib/profile/values';
import { buildTargetsSnapshot, passportToProfile, profileToPassport } from '@/lib/passport/mappers';
import { parsePassport } from '@/lib/passport/parse';
import { parseMtbSetup } from '@/lib/passport/parseMtb';
import { computeBikeFitCoordinates } from '../coordinates';
import { diagnoseSymptoms } from '../diagnostics';
import { DEFAULT_MTB_SETUP } from '../mtb';
import { painsFor, type RiderPainType } from '@/types/baikfit';
import { STOCK_BIKE_SPECS } from '@/lib/bikes';
import { evaluateStockBikeFit } from '@/lib/bikes/evaluateStockBikeFit';
import { buildSummary } from '@/components/report/buildSummary';
import { buildTargets } from '@/components/report/buildTargets';

const trail: ProfileValues = { ...DEFAULT_PROFILE, discipline: 'xc_mtb', acromionWidthMm: 420, currentBarWidthMm: 780, mtb: { style: 'trail', fullSuspension: true, travelMm: 140, sagPercent: 28, dropperTravelMm: 150 } };
const coordinates = computeBikeFitCoordinates({ inseamMm: 840, ridingDiscipline: 'xc_mtb' });

describe('arm pump in the decision matrix (KB 6)', () => {
  it('should map the symptom to its own row, with the steps of the KB', () => {
    expect(diagnoseSymptoms(['arm_pump'])).toEqual(['armPump']);
    const { en, cs } = { en: translations.en.diagnosis.items.armPump, cs: translations.cs.diagnosis.items.armPump };
    expect(en.fixes.join(' ')).toContain('40°–45°');
    expect(cs.fixes.join(' ')).toContain('40°–45°');
    expect(en.fixes).toHaveLength(3);
  });

  it('should offer arm pump only on a mountain bike', () => {
    expect(painsFor('xc_mtb')).toContain('arm_pump');
    expect(painsFor('road')).not.toContain('arm_pump');
    expect(painsFor('gravel')).not.toContain('arm_pump');
    expect(painsFor(undefined)).not.toContain('arm_pump');
  });
});

describe('MTB setup in the passport', () => {
  it('should store the setup with the bike and read it back unchanged', () => {
    const passport = profileToPassport(trail, coordinates);
    expect(passport.bikes[0].mtb).toEqual(trail.mtb);
    expect(passportToProfile(parsePassport(JSON.parse(JSON.stringify(passport)))!).mtb).toEqual(trail.mtb);
  });

  it('should leave a road passport without an MTB setup, and give an old bike the default', () => {
    expect(profileToPassport(DEFAULT_PROFILE, coordinates).bikes[0].mtb).toBeUndefined();
    const old = parsePassport({ ...JSON.parse(JSON.stringify(profileToPassport(DEFAULT_PROFILE, coordinates))) })!;
    expect(passportToProfile(old).mtb).toEqual(DEFAULT_MTB_SETUP);
  });

  it('should keep a setup that was entered when the rider changes the discipline later', () => {
    const first = profileToPassport(trail, coordinates);
    const second = profileToPassport({ ...trail, discipline: 'road' }, coordinates, first);
    expect(second.bikes[0].mtb).toEqual(trail.mtb);
  });

  it('should drop numbers outside the plausible limits and keep the style and the flag', () => {
    expect(parseMtbSetup({ style: 'trail', fullSuspension: true, travelMm: 5000, sagPercent: 2, dropperTravelMm: 150 })).toEqual({ style: 'trail', fullSuspension: true, travelMm: null, sagPercent: null, dropperTravelMm: 150 });
    expect(parseMtbSetup({ style: 'enduro', fullSuspension: 'yes' })).toEqual(DEFAULT_MTB_SETUP);
    expect(parseMtbSetup('x')).toBeUndefined();
  });

  it('should snapshot the flat bar target instead of the drop bar width for a mountain bike', () => {
    expect(buildTargetsSnapshot(trail, coordinates).handlebarWidthMm).toBe(780);
    expect(buildTargetsSnapshot({ acromionWidthMm: 420, discipline: 'xc_mtb', mtb: DEFAULT_MTB_SETUP }, coordinates).handlebarWidthMm).toBe(740);
    expect(buildTargetsSnapshot({ acromionWidthMm: 420, discipline: 'road' }, coordinates).handlebarWidthMm).toBe(420);
  });
});

describe('the drop bar rules do not judge a flat bar', () => {
  const narrowRider: ProfileValues = { ...DEFAULT_PROFILE, acromionWidthMm: 380 };
  const alertsOf = (values: ProfileValues) => evaluateStockBikeFit(profileToPassport(values, coordinates), STOCK_BIKE_SPECS[0], 'M').alerts.map((alert) => alert.component);

  it('should flag the factory bar of a road bike for a narrow rider, and say nothing about it on a mountain bike', () => {
    expect(alertsOf(narrowRider)).toContain('handlebar');
    expect(alertsOf({ ...narrowRider, discipline: 'xc_mtb' })).not.toContain('handlebar');
  });

  it('should show the flat bar target in the print summary of a mountain bike', () => {
    const summary = buildSummary(translations.en, { ...trail, inseamMm: 840, saddleHeightMm: 742, coordinates, riderWeightKg: 75, discipline: 'xc_mtb', currentPains: [] });
    const row = summary.setup.find((r) => r.key === 'handlebar')!;
    expect(row).toMatchObject({ now: '780 mm', target: '780 mm' });
    const road = buildSummary(translations.en, { ...trail, inseamMm: 840, saddleHeightMm: 742, coordinates, riderWeightKg: 75, discipline: 'road', currentPains: [] });
    expect(road.setup.find((r) => r.key === 'handlebar')!.target).toBe('420 mm');
  });

  it('should leave the handlebar out of the four target numbers of a mountain bike', () => {
    const input = { ...trail, inseamMm: 840, saddleHeightMm: 742, currentPains: [] as RiderPainType[] };
    expect(buildTargets(translations.en, input, coordinates, 'xc_mtb').map((target) => target.key)).toEqual(['saddle', 'crank', 'setback']);
    expect(buildTargets(translations.en, { ...input, discipline: 'road' }, coordinates, 'road')).toHaveLength(4);
  });
});
