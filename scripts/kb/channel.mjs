#!/usr/bin/env node
/**
 * Puts a source channel on a tier (A 1.0, B 0.7, C 0.4, D 0.1) or lists the channels.
 * Usage: npm run kb:channel -- "Channel name" --tier B [--note "why"]   |   npm run kb:channel -- --list
 */
import { connect } from './lib/client.mjs';
import { TIER_WEIGHTS } from './lib/weights.mjs';

const argv = process.argv.slice(2);
const flag = (name) => (argv.includes(name) ? argv[argv.indexOf(name) + 1] : undefined);
const db = await connect();
if (argv.includes('--list')) {
  const used = await db.from('kb_sources').select('channel');
  const ranked = await db.from('kb_channels').select('channel, tier, weight, note').order('tier');
  if (used.error || ranked.error) throw new Error((used.error ?? ranked.error).message);
  for (const row of ranked.data) console.log(`${row.tier}  ${String(row.weight).padEnd(4)} ${row.channel}${row.note ? `  (${row.note})` : ''}`);
  const rankedNames = new Set(ranked.data.map((row) => row.channel));
  const open = [...new Set(used.data.map((row) => row.channel))].filter((name) => !rankedNames.has(name));
  console.log(open.length > 0 ? `\nNot ranked yet (count as D): ${open.join(', ')}` : '\nEvery channel is ranked.');
} else {
  const channel = argv[0];
  const tier = flag('--tier');
  if (!channel || channel.startsWith('--') || !(tier in TIER_WEIGHTS)) {
    console.error('Usage: npm run kb:channel -- "Channel name" --tier A|B|C|D [--note "why"]   |   --list');
    process.exit(1);
  }
  const done = await db.from('kb_channels').upsert({ channel, tier, note: flag('--note') ?? null, updated_at: new Date().toISOString() }, { onConflict: 'channel' });
  if (done.error) throw new Error(done.error.message);
  console.log(`"${channel}" is on tier ${tier} (weight ${TIER_WEIGHTS[tier]}).`);
}
