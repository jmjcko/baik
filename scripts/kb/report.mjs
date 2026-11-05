#!/usr/bin/env node
/** Shows per topic how many independent channels agree and how many disagree. Usage: npm run kb:report */
import { connect } from './lib/client.mjs';

const db = await connect();
const { data, error } = await db.from('kb_topic_status').select('*').order('topic_id');
if (error) throw new Error(error.message);
for (const row of data.filter((r) => r.video_claims > 0 || r.proposed)) {
  const flags = [row.proposed ? 'NEW TOPIC' : '', row.ready ? 'READY' : '', row.conflicts > 0 ? 'CONFLICT' : ''].filter(Boolean).join(' ');
  console.log(`${row.topic_id.padEnd(22)} ${row.title.slice(0, 44).padEnd(46)} channels agree: ${row.agreeing_channels}, conflicts: ${row.conflicts}, to review: ${row.to_review} ${flags}`);
}
console.log(`\n${data.length} topics, ${data.filter((r) => r.video_claims > 0).length} with video evidence.`);
