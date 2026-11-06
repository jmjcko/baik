import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { translations } from '@/lib/i18n/translations';
import { barTargetMm } from '../rules';
import { buildUpgradeMatrix } from '../upgradeMatrix';
import { UPGRADE_IDS, type UpgradeInput } from '../types';

const base: UpgradeInput = { discipline: 'road', pains: [], wear: [] };
const ids = (input: Partial<UpgradeInput>) => buildUpgradeMatrix({ ...base, ...input }).map((item) => item.id);
const BRANDS = /shimano|sram|garmin|continental|pirelli|vittoria|tubolito|schwalbe|\bsoul\b|silca|magene|bryton|\blake\b|\bbont\b|specialized|\btrek\b|canyon|wahoo|campagnolo|\bgp5000\b|varia/i;
const PRICES = /£|€|\$|\bgbp\b|\beur\b|\busd\b|\bczk\b|kč|\bprice|\bcost|\bcena|\bcen[yu]\b|\bstoj[ií]\s+\d/i;

describe('buildUpgradeMatrix scope', () => {
  it.each(['ebike', 'city', 'trekking', '', 'e-mtb'])('should give nothing for %j', (discipline) => {
    expect(buildUpgradeMatrix({ ...base, discipline, pains: ['front_knee'] })).toEqual([]);
  });
  it.each(['road', 'gravel', 'mtb'])('should give a matrix for %s', (discipline) => {
    expect(ids({ discipline })).toContain('pressure');
  });
});

describe('buildUpgradeMatrix rules', () => {
  it('should put the worn safety parts first', () => {
    const result = ids({ wear: [{ id: 'chainStretch', wear: 1.2 }, { id: 'brakeCheck', wear: 1 }] });
    expect(result.slice(0, 2)).toEqual(['chainWorn', 'padsWorn']);
    expect(ids({ wear: [{ id: 'chainStretch', wear: 0.99 }, { id: 'brakeCheck', wear: 0.5 }] })).not.toContain('chainWorn');
  });
  it('should recommend 28 to 32 mm tyres on a road bike only', () => {
    expect(buildUpgradeMatrix(base).find((i) => i.id === 'tyreWidth')?.range).toEqual({ min: 28, max: 32, unit: 'mm' });
    expect(ids({ discipline: 'gravel' })).not.toContain('tyreWidth');
    expect(ids({ discipline: 'mtb' })).not.toContain('tyreWidth');
  });
  it('should suggest tubeless only when the rider rides tubes', () => {
    expect(ids({ tubeless: false })).toContain('tubeless');
    expect(ids({ tubeless: true })).not.toContain('tubeless');
    expect(ids({ tubeless: null })).not.toContain('tubeless');
  });
  it.each([[390, 380], [400, 400], [419, 400], [440, 440], [500, 440], [300, 380]])('should round the acromion %d to the bar %d', (acromion, bar) => {
    expect(barTargetMm(acromion)).toBe(bar);
  });
  it('should propose a narrower bar only when the bar is wider than the shoulders allow', () => {
    const wide = buildUpgradeMatrix({ ...base, barWidthMm: 420, acromionMm: 390 }).find((i) => i.id === 'handlebarWidth');
    expect(wide?.range).toEqual({ min: 380, max: 380, unit: 'mm' });
    expect(ids({ barWidthMm: 380, acromionMm: 390 })).not.toContain('handlebarWidth');
    expect(ids({ barWidthMm: 420 })).not.toContain('handlebarWidth');
    expect(ids({ discipline: 'mtb', barWidthMm: 800, acromionMm: 390 })).not.toContain('handlebarWidth');
  });
  it('should turn the levers 8 to 15 degrees for numb hands and neck pain, on a drop bar only', () => {
    const item = buildUpgradeMatrix({ ...base, pains: ['numb_hands'] }).find((i) => i.id === 'leverAngle');
    expect(item?.range).toEqual({ min: 8, max: 15, unit: 'deg' });
    expect(ids({ pains: ['neck_pain'] })).toEqual(expect.arrayContaining(['leverAngle', 'leverReach']));
    expect(ids({ discipline: 'mtb', pains: ['numb_hands'] })).not.toContain('leverAngle');
  });
  it('should connect the symptoms with insoles and the saddle', () => {
    expect(ids({ pains: ['front_knee'] })).toContain('archInsoles');
    expect(ids({ pains: ['saddle_sores'] })).toContain('anatomicalSaddle');
    expect(ids({})).not.toContain('archInsoles');
  });
  it('should shorten a crank of 172.5 mm or more for a knee or back symptom', () => {
    const item = buildUpgradeMatrix({ ...base, crankMm: 172.5, pains: ['front_knee'] }).find((i) => i.id === 'crankLength');
    expect(item?.range).toEqual({ min: 160, max: 165, unit: 'mm' });
    expect(ids({ crankMm: 165, pains: ['front_knee'] })).not.toContain('crankLength');
    expect(ids({ crankMm: 175 })).not.toContain('crankLength');
  });
  it('should list the high tier before the low tier, each by rank', () => {
    const result = buildUpgradeMatrix({ ...base, pains: ['front_knee'], tubeless: false });
    const tiers = result.map((i) => i.tier);
    expect(tiers).toEqual([...tiers].sort((a, b) => (a === b ? 0 : a === 'high' ? -1 : 1)));
    expect(result.map((i) => i.id)).toEqual(['tyreWidth', 'pressure', 'tubeless', 'archInsoles', 'ceramic', 'ospw', 'electronicMisfit', 'deepWheels']);
  });
  it('should show the misfit warning only for a rider with a symptom', () => {
    expect(ids({})).not.toContain('electronicMisfit');
    expect(ids({ pains: ['lower_back'] })).toContain('electronicMisfit');
  });
  it('should be pure: the same input, the same result, the input untouched', () => {
    const input: UpgradeInput = { ...base, pains: ['front_knee'], wear: [{ id: 'brakeCheck', wear: 2 }] };
    const copy = JSON.stringify(input);
    expect(buildUpgradeMatrix(input)).toEqual(buildUpgradeMatrix(input));
    expect(JSON.stringify(input)).toBe(copy);
  });
  it('should name a knowledge-base section for every item', () => {
    const everything = buildUpgradeMatrix({ ...base, pains: ['front_knee', 'numb_hands', 'saddle_sores'], tubeless: false, crankMm: 172.5, barWidthMm: 440, acromionMm: 380, wear: [{ id: 'chainStretch', wear: 2 }, { id: 'brakeCheck', wear: 2 }] });
    expect(everything).toHaveLength(UPGRADE_IDS.length);
    expect(everything.every((item) => /KB v1\.\d\.\d/.test(item.source))).toBe(true);
  });
});

describe('the texts of the matrix', () => {
  for (const locale of ['en', 'cs'] as const) {
    const texts = translations[locale].upgrade;
    it(`should have a title and a body for every upgrade (${locale})`, () => {
      for (const id of UPGRADE_IDS) {
        expect(texts.items[id].title.length).toBeGreaterThan(5);
        expect(texts.items[id].body.length).toBeGreaterThan(20);
      }
    });
    it(`should contain no brand, no product and no price (${locale})`, () => {
      const all = JSON.stringify(texts);
      expect(JSON.stringify(translations[locale].gearKb.insights)).not.toMatch(BRANDS);
      expect(JSON.stringify(translations[locale].gearKb.insights)).not.toMatch(PRICES);
      expect(all).not.toMatch(BRANDS);
      expect(all).not.toMatch(PRICES);
    });
  }
  it('should contain no brand and no price in the result of the engine either', () => {
    const result = buildUpgradeMatrix({ ...base, pains: ['front_knee', 'numb_hands', 'saddle_sores'], tubeless: false, crankMm: 172.5, barWidthMm: 440, acromionMm: 380, wear: [{ id: 'chainStretch', wear: 2 }, { id: 'brakeCheck', wear: 2 }] });
    expect(JSON.stringify(result)).not.toMatch(BRANDS);
    expect(JSON.stringify(result)).not.toMatch(PRICES);
  });
});

describe('the knowledge base v1.1.0', () => {
  const kb = readFileSync('docs/knowledge/baikshop_kb_v1.1.0.md', 'utf8');
  const section = kb.slice(kb.indexOf('## 6. Parameter Rules'));
  it('should carry the owner baselines of the matrix', () => {
    expect(section).toContain('28 to 32 mm');
    expect(section).toContain('8 to 15 degrees');
    expect(section).toMatch(/Lever reach/);
    expect(section).toMatch(/arch support/);
    expect(section.match(/\[owner baseline\]/g)?.length).toBeGreaterThanOrEqual(4);
  });
  it('should give no brand and no price in section 6', () => {
    expect(section).not.toMatch(BRANDS);
    expect(section).not.toMatch(PRICES);
  });
});
