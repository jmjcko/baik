#!/usr/bin/env node
/**
 * Fills the evidence base from the released knowledge base files: the topics and the rules, word for word, with the file and the section.
 * Run it after a new version of a file is released: the rules of origin "kb" of that file are replaced, what was learnt from videos stays.
 * Usage: npm run kb:seed
 */
import { readFileSync } from 'node:fs';
import { connect } from './lib/client.mjs';
import { parseKb, prefixOf } from './lib/parseKb.mjs';

export const FILES = ['docs/knowledge/baikfit_kb_v1.5.0.md', 'docs/knowledge/baikcare_kb_v1.1.0.md'];

const db = await connect();
for (const path of FILES) {
  const file = path.replace(/^.*\//, '');
  const { topics, claims } = parseKb(readFileSync(path, 'utf8'), file);
  const prefix = prefixOf(file);
  const topicRows = topics.map(({ id, section, title }) => ({ id, file, section, title, proposed: false }));
  const upsert = await db.from('kb_topics').upsert(topicRows, { onConflict: 'id' });
  if (upsert.error) throw new Error(`topics of ${file}: ${upsert.error.message}`);
  const cleared = await db.from('kb_claims').delete().eq('origin', 'kb').like('topic_id', `${prefix}-%`);
  if (cleared.error) throw new Error(`clearing ${prefix}: ${cleared.error.message}`);
  const seen = new Set();
  const rows = claims.filter(({ topicId, claim }) => !seen.has(`${topicId}|${claim}`) && seen.add(`${topicId}|${claim}`)).map(({ topicId, kbRef, claim }) => ({ topic_id: topicId, origin: 'kb', kb_ref: kbRef, claim, status: 'approved' }));
  for (let i = 0; i < rows.length; i += 200) {
    const insert = await db.from('kb_claims').insert(rows.slice(i, i + 200));
    if (insert.error) throw new Error(`rules of ${file}: ${insert.error.message}`);
  }
  console.log(`${file}: ${topics.length} topics, ${rows.length} rules`);
}
