import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { DEFAULT_PROFILE, deriveCoordinates } from '@/lib/profile/values';
import { translations } from '@/lib/i18n/translations';
import { lukeContext } from '@/lib/agents/gearPrefill';
import { buildMasterPrompt } from '@/lib/agents/lukeCykloAgent';
import { pressureGuide, tyreCategory } from '@/lib/engines/baikcare/tyrePressure';
import { profileToPassport, passportToProfile } from '../mappers';
import { addRider, switchActiveRider } from '../riders';
import { buildExport, onlyRiders } from '../exportFile';
import { activeBikeOf } from '../garage';

/** The words that belong to the body, the pains, the tests and the riders of the account (Epic 43: none of them may reach an AI call). */
const BODY_WORDS = ['anatomy', 'symptoms', 'mobility', 'weightKg', 'riderWeightKg', 'inseamMm', 'heightCm', 'acromionWidthMm', 'torsoLengthMm', 'armLengthMm', 'currentPains', 'hamstring', 'riders', 'primaryRiderId', 'RiderPassport', 'ProfileValues', 'PassportRider'];

describe('the body data of the riders never reaches an AI call', () => {
  const dir = 'src/app/actions';
  const files = readdirSync(dir).filter((name) => name.endsWith('.ts'));

  it.each(files)('should keep every body or rider word out of the Server Action %s', (file) => {
    const source = readFileSync(`${dir}/${file}`, 'utf8');
    for (const word of BODY_WORDS) expect(source, `${file} mentions ${word}`).not.toMatch(new RegExp(`\\b${word}\\b`));
  });

  it('should find the Server Actions of the app (the guard would pass on an empty folder)', () => {
    expect(files).toEqual(expect.arrayContaining(['analyzeBikeGeometry.ts', 'extractStockBikeSpec.ts', 'findBikes.ts', 'researchGearParameters.ts']));
  });

  it('should carry only four measurements in the rider context of the master prompt, and never a name or an id', () => {
    const context = lukeContext({ ...DEFAULT_PROFILE });
    expect(Object.keys(context.rider).sort()).toEqual(['acromionWidthMm', 'heightCm', 'inseamMm', 'riderWeightKg']);
  });

  it('should not write the name of a rider into the master prompt, with the body included or not', () => {
    const t = translations.en;
    const input = { productTitle: 'Bar tape', category: null, parameters: [], notes: '', ...lukeContext({ ...DEFAULT_PROFILE }) };
    for (const include of [{ rider: true, bike: true }, { rider: false, bike: false }]) {
      expect(buildMasterPrompt(t, { ...input, include } as never)).not.toContain('Eva');
    }
  });
});

describe('tyre pressure follows the rider of the bike (Epic 43)', () => {
  const coordinates = deriveCoordinates(DEFAULT_PROFILE);
  const mine = { ...DEFAULT_PROFILE, riderWeightKg: 90 };
  const base = profileToPassport(mine, coordinates);
  const withEva = addRider(base, { riderId: 'r2', name: 'Eva', bikeId: 'b2', bikeName: 'Eva road', discipline: 'road' })!;
  const evaValues = { ...passportToProfile(withEva), riderWeightKg: 58 };
  const both = profileToPassport(evaValues, coordinates, withEva);

  it('should give each bike the pressure of the weight of its own rider', () => {
    const evaBar = pressureGuide(tyreCategory(evaValues.discipline), passportToProfile(both).riderWeightKg).bar;
    const myBar = pressureGuide(tyreCategory('road'), passportToProfile(switchActiveRider(both, 'me')!).riderWeightKg).bar;
    expect(activeBikeOf(both)?.primaryRiderId).toBe('r2');
    expect(evaBar).toBeLessThan(myBar);
    expect(passportToProfile(switchActiveRider(both, 'me')!).riderWeightKg).toBe(90);
  });
});

describe('the export of the account by rider', () => {
  const coordinates = deriveCoordinates(DEFAULT_PROFILE);
  const withEva = addRider(profileToPassport(DEFAULT_PROFILE, coordinates), { riderId: 'r2', name: 'Eva', bikeId: 'b2', bikeName: 'Eva road', discipline: 'road' })!;
  const record = { passport: withEva, createdAt: null, updatedAt: null };
  const account = { email: null, createdAt: null };
  const now = new Date('2026-11-02T10:00:00Z');

  it('should hold every rider and bike when no choice is made', () => {
    expect(buildExport(record, account, now).passport.riders).toHaveLength(2);
    expect(buildExport(record, account, now).passport.bikes).toHaveLength(2);
  });

  it('should keep only the chosen riders and their bikes, and leave nothing of the others in the text', () => {
    const exported = buildExport(record, account, now, [], ['me']);
    expect(exported.passport.riders.map((rider) => rider.id)).toEqual(['me']);
    expect(exported.passport.bikes.map((bike) => bike.id)).toEqual(['current']);
    expect(exported.passport.activeBikeId).toBe('current');
    expect(JSON.stringify(exported)).not.toContain('Eva');
  });

  it('should keep a candidate bike (it has no rider) when riders are chosen', () => {
    const withCandidate = { ...withEva, bikes: [...withEva.bikes, { id: 'c1', kind: 'candidate' as const, name: 'Canyon' }] };
    expect(onlyRiders(withCandidate, ['r2']).bikes.map((bike) => bike.id)).toEqual(['b2', 'c1']);
  });
});
