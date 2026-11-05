#!/usr/bin/env node
/**
 * The inbox of the evidence base: what the owner left on the admin page and the assistant has not processed yet.
 * Usage: npm run kb:inbox                       the waiting items (id, link, title, channel)
 *        npm run kb:inbox -- show <id> <file>   writes the transcript of one item to a file (outside the repository); without one it is downloaded with kb:fetch
 *        npm run kb:inbox -- done <id>          deletes the item (after its claims were saved with kb:add)
 */
import { writeFileSync } from 'node:fs';
import { connect } from './lib/client.mjs';
import { fetchTranscript } from './lib/transcript.mjs';

const [command, id, file] = process.argv.slice(2);
const db = await connect();
if (command === 'done' && id) {
  const { error } = await db.from('kb_inbox').delete().eq('id', id);
  if (error) throw new Error(error.message);
  console.log('Deleted from the inbox.');
} else if (command === 'show' && id && file) {
  const { data, error } = await db.from('kb_inbox').select('youtube_id, body').eq('id', id).single();
  if (error) throw new Error(error.message);
  const fetched = data.body ? null : await fetchTranscript(`https://www.youtube.com/watch?v=${data.youtube_id}`);
  const text = fetched ? `${fetched.url}\n${fetched.title}\n${fetched.channel}\n\n${fetched.transcript}\n` : data.body;
  writeFileSync(file, text);
  console.log(`Transcript written to ${file} (${text.length} characters${fetched ? `, downloaded: ${fetched.title}, ${fetched.channel}` : ''}).`);
} else {
  const { data, error } = await db.from('kb_inbox').select('id, youtube_id, title, channel, created_at').order('created_at');
  if (error) throw new Error(error.message);
  for (const row of data) console.log(`${row.id}  https://www.youtube.com/watch?v=${row.youtube_id}  ${row.channel ?? '?'}: ${row.title ?? '?'}`);
  console.log(`\n${data.length} waiting.`);
}
