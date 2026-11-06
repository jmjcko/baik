import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseKb, prefixOf } from '../lib/parseKb.mjs';
import { secondsOf, validateAdd, youtubeIdOf } from '../lib/validate.mjs';
import { fromJson3 } from '../lib/transcript.mjs';
import { TIER_WEIGHTS, topicWeights, weightOfTier } from '../lib/weights.mjs';
import { parseReviewArgs, pickClaims } from '../lib/review.mjs';

const FILES = ['docs/knowledge/baikfit_kb_v1.5.0.md', 'docs/knowledge/baikcare_kb_v1.2.0.md'];
const NUMBER = /\d+(?:[.,]\d+)?/g;

describe('parseKb', () => {
  it('splits headings into topics and keeps lines word for word', () => {
    const md = '# T\n## 1. First *topic*\n- rule **A** 10 mm\n| a | b |\n|---|---|\n| 5 | 6 |\n> quote\n```\n{"x": 1}\n```\n### 1.1 Sub\n2. second 7';
    const { topics, claims } = parseKb(md, 'baikfit_kb_v1.md');
    expect(topics.map((t) => t.id)).toEqual(['baikfit-1', 'baikfit-1-1']);
    expect(claims.map((c) => c.claim)).toEqual(['rule **A** 10 mm', 'a | b', '5 | 6', 'second 7']);
    expect(claims[0].kbRef).toBe('baikfit_kb_v1.md §1');
  });
  it('gives the same prefix for every version of a file', () => expect(prefixOf('docs/knowledge/baikfit_kb_v1.5.0.md')).toBe('baikfit'));
  it('splits an over-long line without losing a character of numbers', () => {
    const long = Array.from({ length: 120 }, (_, i) => `Sentence ${i} says ${i * 7} mm.`).join(' ');
    const { claims } = parseKb(`## 1. T\n- ${long}`, 'x_kb.md');
    expect(claims.length).toBeGreaterThan(1);
    expect(claims.every((c) => c.claim.length <= 1500)).toBe(true);
    expect(claims.map((c) => c.claim).join(' ').match(NUMBER)).toEqual(long.match(NUMBER));
  });
  it.each(FILES)('%s: every number of the file is seeded, under a topic with a unique id', (path) => {
    const md = readFileSync(path, 'utf8');
    const { topics, claims } = parseKb(md, path.split('/').pop());
    expect(new Set(topics.map((t) => t.id)).size).toBe(topics.length);
    expect(claims.length).toBeGreaterThan(30);
    const seeded = claims.map((c) => c.claim).join('\n');
    const body = md.split('\n').filter((l) => !/^#{1,6}\s/.test(l) && !l.trim().startsWith('>')).join('\n').replace(/```[\s\S]*?```/g, '');
    const missing = (body.match(NUMBER) ?? []).filter((n) => !seeded.includes(n));
    expect(missing).toEqual([]);
  });
});

describe('validate', () => {
  const ok = { source: { url: 'https://youtu.be/dQw4w9WgXcQ?t=5', title: 'T', channel: 'C' }, claims: [{ topic: 'baikfit-3', claim: 'Saddle 109 %', value: 109, unit: '%', at: '3:48', relation: 'agrees' }] };
  it('reads YouTube links and times', () => {
    expect(youtubeIdOf('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=3')).toBe('dQw4w9WgXcQ');
    expect(youtubeIdOf('https://evil.example/watch?v=dQw4w9WgXcQ')).toBeNull();
    expect(secondsOf('1:02:03')).toBe(3723);
    expect(secondsOf('3:48')).toBe(228);
    expect(secondsOf(-1)).toBeNaN();
    expect(secondsOf('x')).toBeNaN();
  });
  it('accepts a good input as proposed video claims', () => {
    const r = validateAdd(ok, new Set(['baikfit-3']));
    expect(r.ok).toBe(true);
    expect(r.claims[0]).toMatchObject({ origin: 'video', status: 'proposed', at_seconds: 228, topic_id: 'baikfit-3' });
    expect(r.source.youtube_id).toBe('dQw4w9WgXcQ');
  });
  it('flags a new topic as proposed', () => {
    const r = validateAdd({ ...ok, newTopics: [{ id: 'new-1', title: 'Cleat wedges' }], claims: [{ ...ok.claims[0], topic: 'new-1' }] }, new Set());
    expect(r.ok && r.topics[0]).toMatchObject({ id: 'new-1', proposed: true });
  });
  it.each([
    [{ ...ok, source: { ...ok.source, url: 'https://x.com/a' } }, 'YouTube'],
    [{ ...ok, claims: [{ ...ok.claims[0], topic: 'nope' }] }, 'unknown topic'],
    [{ ...ok, claims: [{ ...ok.claims[0], relation: 'maybe' }] }, 'relation'],
    [{ ...ok, claims: [{ ...ok.claims[0], at: undefined }] }, 'time'],
    [{ ...ok, claims: [] }, 'claims'],
  ])('rejects a bad input (%#)', (input, part) => {
    const r = validateAdd(input, new Set(['baikfit-3']));
    expect(r.ok).toBe(false);
    expect(r.errors.join(' ')).toContain(part);
  });
});

describe('fromJson3', () => {
  it('turns captions into timed lines and skips events without words', () => {
    const json = { events: [{ tStartMs: 0 }, { tStartMs: 2940, segs: [{ utf8: 'Holy' }, { utf8: ' Grail' }] }, { tStartMs: 12830, segs: [{ utf8: '\n' }] }, { tStartMs: 3723000, segs: [{ utf8: 'late  words' }] }] };
    expect(fromJson3(json)).toBe('0:02 Holy Grail\n1:02:03 late words');
  });
});

describe('the weights of the channels', () => {
  const ch = (channel, tier) => ({ channel, tier });
  it('uses 1.0 / 0.7 / 0.4 / 0.1 and tier D for a channel nobody ranked', () => {
    expect([TIER_WEIGHTS.A, TIER_WEIGHTS.B, TIER_WEIGHTS.C, TIER_WEIGHTS.D]).toEqual([1.0, 0.7, 0.4, 0.1]);
    expect(weightOfTier(undefined)).toBe(0.1);
  });
  it('is ready at a weight of 2.0 with no heavy conflict', () => {
    expect(topicWeights([ch('a', 'A'), ch('b', 'A')], [])).toEqual({ agree: 2, heavy: 0, ready: true });
    expect(topicWeights([ch('a', 'B'), ch('b', 'B'), ch('c', 'C')], [])).toMatchObject({ agree: 1.8, ready: false });
    expect(topicWeights([ch('a', 'A'), ch('b', 'B'), ch('c', 'B')], []).ready).toBe(true);
  });
  it('counts a channel once, and three unranked channels are not enough', () => {
    expect(topicWeights([ch('a', 'A'), ch('a', 'A')], []).agree).toBe(1);
    expect(topicWeights([ch('a'), ch('b'), ch('c')], []).ready).toBe(false);
  });
  it('is blocked by a conflict of a channel of 0.7 or more, not by a lighter one', () => {
    expect(topicWeights([ch('a', 'A'), ch('b', 'A')], [ch('x', 'B')])).toMatchObject({ heavy: 1, ready: false });
    expect(topicWeights([ch('a', 'A'), ch('b', 'A')], [ch('x', 'C'), ch('y')]).ready).toBe(true);
  });
  it('matches the migration', () => {
    const sql = readFileSync('supabase/migrations/20261107000000_kb_channels.sql', 'utf8');
    expect(sql).toContain("when 'A' then 1.0 when 'B' then 0.7 when 'C' then 0.4 else 0.1");
    expect(sql).toContain('agree.w >= 2.0 and heavy.n = 0');
    expect(sql).toContain('coalesce(k3.weight, 0.1) >= 0.7');
    expect(sql).toMatch(/enable row level security/i);
    expect(sql).toContain('is_kb_curator()');
  });
});

describe('kb:approve and kb:reject arguments', () => {
  const rows = [{ id: 'aaaaaaaa-1', topic_id: 't1' }, { id: 'bbbbbbbb-2', topic_id: 't1' }, { id: 'aaaaaaab-3', topic_id: 't2' }];
  it('needs --list, a claim or a topic with --all', () => {
    expect(parseReviewArgs([]).errors).toHaveLength(1);
    expect(parseReviewArgs(['--topic', 't1']).errors[0]).toContain('--all');
    expect(parseReviewArgs(['--bogus']).errors[0]).toContain('--bogus');
    expect(parseReviewArgs(['--list']).errors).toEqual([]);
  });
  it('picks claims by id prefix and by topic', () => {
    expect(pickClaims(rows, parseReviewArgs(['--claim', 'bbbbbbbb']))).toEqual({ ids: ['bbbbbbbb-2'] });
    expect(pickClaims(rows, parseReviewArgs(['--topic', 't1', '--all']))).toEqual({ ids: ['aaaaaaaa-1', 'bbbbbbbb-2'] });
  });
  it('refuses a short, unknown or ambiguous id and an empty topic', () => {
    expect(pickClaims(rows, parseReviewArgs(['--claim', 'aaaaaaa'])).error).toContain('8 characters');
    expect(pickClaims(rows, parseReviewArgs(['--claim', 'cccccccc'])).error).toContain('0 proposed');
    expect(pickClaims(rows, parseReviewArgs(['--topic', 'zz', '--all'])).error).toContain('no proposed');
  });
});
