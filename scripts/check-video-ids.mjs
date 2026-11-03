#!/usr/bin/env node
/**
 * Asks YouTube about every video of the app (bAIkcare and bAIkfit tables): does the id exist (oEmbed answers 200), may it be embedded,
 * does the title and the channel still match, and does the start second lie inside the video. Run it by hand: `npm run check:videos`.
 * It needs the network, so it is not part of the unit tests. It exits with 1 when something is wrong.
 */
import { readFileSync } from 'node:fs';

const FILES = ['src/lib/care/videoGuides.ts', 'src/lib/fit/fitVideoGuides.ts'];
const UA = { 'User-Agent': 'Mozilla/5.0 (compatible; baik-video-check)', 'Accept-Language': 'en' };

/** Reads the string literal of the source (it may hold \uXXXX escapes) without running the file. */
const literal = (text) => JSON.parse(`"${text.replace(/\\'/g, "'").replace(/"/g, '\\"')}"`);

function entries() {
  const found = [];
  for (const file of FILES) {
    const text = readFileSync(file, 'utf8');
    for (const line of text.split('\n')) {
      const m = /youtubeId: '([^']+)', timestampSec: (\d+), title: '((?:[^'\\]|\\.)*)', channelName: '((?:[^'\\]|\\.)*)'/.exec(line);
      if (m) found.push({ file, id: m[1], at: Number(m[2]), title: literal(m[3]), channel: literal(m[4]) });
    }
  }
  return found;
}

async function oembed(id) {
  const url = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`;
  const res = await fetch(url, { headers: UA });
  return res.status === 200 ? { status: 200, ...(await res.json()) } : { status: res.status };
}

async function details(id) {
  const html = await (await fetch(`https://www.youtube.com/watch?v=${id}&hl=en`, { headers: UA })).text();
  return {
    embeddable: /"playableInEmbed":true/.test(html),
    length: Number(/"lengthSeconds":"(\d+)"/.exec(html)?.[1] ?? NaN),
  };
}

const problems = [];
const seen = new Map();
for (const entry of entries()) {
  if (!/^[A-Za-z0-9_-]{11}$/.test(entry.id)) { problems.push(`${entry.id}: not an 11 character id`); continue; }
  if (!seen.has(entry.id)) seen.set(entry.id, { embed: await oembed(entry.id), more: null });
  const known = seen.get(entry.id);
  if (known.embed.status !== 200) { problems.push(`${entry.id}: oEmbed answered ${known.embed.status}`); continue; }
  known.more ??= await details(entry.id);
  if (!known.more.embeddable) problems.push(`${entry.id}: cannot be embedded`);
  if (known.embed.title.trim() !== entry.title.trim()) problems.push(`${entry.id}: title is now "${known.embed.title}"`);
  if (known.embed.author_name.trim() !== entry.channel.trim()) problems.push(`${entry.id}: channel is now "${known.embed.author_name}"`);
  if (Number.isFinite(known.more.length) && entry.at >= known.more.length) problems.push(`${entry.id}: start ${entry.at}s is past the end (${known.more.length}s)`);
}

console.log(`${seen.size} videos checked (${entries().length} places).`);
if (problems.length > 0) {
  console.error(problems.map((p) => `  PROBLEM ${p}`).join('\n'));
  process.exit(1);
}
console.log('All ids exist, can be embedded, and match their title and channel.');
