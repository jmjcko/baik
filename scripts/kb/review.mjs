/** Shared body of kb:approve and kb:reject: sets the status of proposed claims from videos. */
import { connect } from './lib/client.mjs';
import { parseReviewArgs, pickClaims } from './lib/review.mjs';

export async function review(status, name) {
  const args = parseReviewArgs(process.argv.slice(2));
  if (args.errors.length > 0) {
    console.error(`${args.errors.join('\n')}\nUsage: npm run ${name} -- --list | --claim <id> [--claim <id>] | --topic <id> --all`);
    process.exit(1);
  }
  const db = await connect();
  const { data, error } = await db.from('kb_claims').select('id, topic_id, relation, claim, at_seconds, kb_sources(title, channel)').eq('origin', 'video').eq('status', 'proposed').order('topic_id');
  if (error) throw new Error(error.message);
  if (args.list) {
    for (const row of data) console.log(`${row.id.slice(0, 8)}  ${row.topic_id.padEnd(22)} ${String(row.relation).padEnd(9)} [${row.kb_sources?.channel}] ${row.claim.slice(0, 110)}`);
    console.log(`\n${data.length} proposed claims from videos.`);
    return;
  }
  const picked = pickClaims(data, args);
  if (picked.error) {
    console.error(picked.error);
    process.exit(1);
  }
  const done = await db.from('kb_claims').update({ status }).in('id', picked.ids);
  if (done.error) throw new Error(done.error.message);
  console.log(`${picked.ids.length} claims set to ${status}.`);
}
