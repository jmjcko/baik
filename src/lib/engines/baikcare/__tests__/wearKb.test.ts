import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { ELEVATION_STEP, RAIN_FACTOR, SWEAT_TRAINER_FACTOR, TERRAIN_FACTOR, WEAR_COMPONENTS, WEAR_INTERVALS } from '../wearIntervals';

const kb = readFileSync('docs/knowledge/baikcare_kb_v1.2.0.md', 'utf8');
const old = readFileSync('docs/knowledge/baikcare_kb_v1.1.0.md', 'utf8');
const grouped = (n: number): string => n.toLocaleString('en-US');
const section = (heading: string): string => kb.slice(kb.indexOf(heading), kb.indexOf('\n## ', kb.indexOf(heading) + 5));

describe('the intervals of the engine are the intervals of KB bAIkcare v1.2.0 (5b)', () => {
  const table = section('## 5b.');

  it.each(WEAR_COMPONENTS)('should list %s with its distance, climbing and time', (id) => {
    const row = table.split('\n').find((line) => line.startsWith(`| \`${id}\``)) ?? '';
    const interval = WEAR_INTERVALS[id];
    expect(row).not.toBe('');
    expect(row).toContain(`**${grouped(interval.km)} km**`);
    if (interval.elevationM) expect(row).toContain(`**${grouped(interval.elevationM)} m**`);
    if (interval.months) expect(row).toMatch(new RegExp(`\\*\\*${interval.months} months?\\*\\*`));
  });

  it('should state the multipliers of the code', () => {
    for (const factor of Object.values(TERRAIN_FACTOR)) expect(table).toContain(`**${factor.toFixed(1)}**`);
    expect(table).toContain(`**${SWEAT_TRAINER_FACTOR.toFixed(1)}**`);
    expect(table).toContain(`**${RAIN_FACTOR}**`);
    expect(table).toContain(`+${ELEVATION_STEP}`);
  });

  it('should name the scored parts of the code in the Health Score rule', () => {
    const rule = section('### 5b.3');
    for (const id of WEAR_COMPONENTS) expect(rule.includes(`\`${id}\``)).toBe(true);
    for (const id of ['chainStretch', ...WEAR_COMPONENTS.filter((c) => WEAR_INTERVALS[c].scored)]) expect(rule.split('The routine jobs')[0]).toContain(`\`${id}\``);
    for (const id of WEAR_COMPONENTS.filter((c) => !WEAR_INTERVALS[c].scored)) expect(rule.split('The routine jobs')[0]).not.toContain(`\`${id}\``);
  });

  it('should mark the numbers as the owner baseline and keep sections 1 to 6 of v1.1.0', () => {
    expect(kb).toMatch(/Every distance number in section 5b is `\[owner baseline\]`/);
    const numbers = (text: string) => [...text.matchAll(/^## (\d+)\./gm)].map((m) => Number(m[1]));
    expect(numbers(kb)).toEqual(numbers(old));
    for (const part of ['0.50% Elongation', 'Replace handlebar tape on indoor trainer bikes every 6 months', 'Replenish liquid sealant every 3–6 months']) expect(kb).toContain(part);
  });
});
