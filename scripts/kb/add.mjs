#!/usr/bin/env node
/**
 * Writes what was learnt from one video into the evidence base (status "proposed"; the transcript itself is never stored).
 * Usage: npm run kb:add -- path/to/input.json   (shape: see lib/validate.mjs)
 */
import { readFileSync } from 'node:fs';
import { connect } from './lib/client.mjs';
import { validateAdd } from './lib/validate.mjs';

const path = process.argv[2];
if (!path) {
  console.error('Usage: npm run kb:add -- input.json');
  process.exit(1);
}
const db = await connect();
const known = await db.from('kb_topics').select('id');
if (known.error) throw new Error(known.error.message);
const result = validateAdd(JSON.parse(readFileSync(path, 'utf8')), new Set(known.data.map((row) => row.id)));
if (!result.ok) {
  console.error(`Nothing was written:\n- ${result.errors.join('\n- ')}`);
  process.exit(1);
}
if (result.topics.length > 0) {
  const topics = await db.from('kb_topics').upsert(result.topics, { onConflict: 'id', ignoreDuplicates: true });
  if (topics.error) throw new Error(topics.error.message);
}
const source = await db.from('kb_sources').upsert(result.source, { onConflict: 'youtube_id' }).select('id').single();
if (source.error) throw new Error(source.error.message);
const claims = await db.from('kb_claims').insert(result.claims.map((row) => ({ ...row, source_id: source.data.id })));
if (claims.error) throw new Error(claims.error.message);
console.log(`Saved ${result.claims.length} claims from "${result.source.title}"${result.topics.length > 0 ? `; NEW TOPICS: ${result.topics.map((topic) => topic.title).join(', ')}` : ''}.`);
