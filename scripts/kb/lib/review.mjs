/** Arguments and the choice of claims for kb:approve and kb:reject. */
const VALUE_FLAGS = new Set(['--topic', '--claim']);

export function parseReviewArgs(argv) {
  const args = { list: false, all: false, topic: null, claims: [], errors: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    if (flag === '--list') args.list = true;
    else if (flag === '--all') args.all = true;
    else if (VALUE_FLAGS.has(flag) && argv[i + 1] && !argv[i + 1].startsWith('--')) {
      if (flag === '--topic') args.topic = argv[i + 1];
      else args.claims.push(argv[i + 1]);
      i += 1;
    } else args.errors.push(`Unknown or incomplete argument "${flag}".`);
  }
  if (!args.list && !args.topic && args.claims.length === 0) args.errors.push('Give --list, --claim <id> or --topic <id> --all.');
  if (args.topic && !args.all && args.claims.length === 0) args.errors.push('--topic needs --all (every proposed claim of the topic) or --claim <id>.');
  return args;
}

/** rows: proposed claims { id, topic_id }; an id may be given by its first 8 or more characters. Returns { ids } or { error }. */
export function pickClaims(rows, args) {
  const ids = new Set();
  for (const wanted of args.claims) {
    const found = rows.filter((row) => row.id.startsWith(wanted));
    if (wanted.length < 8 || found.length !== 1) return { error: `"${wanted}" matches ${found.length} proposed claims (use at least 8 characters of the id).` };
    ids.add(found[0].id);
  }
  if (args.topic && args.all) {
    const ofTopic = rows.filter((row) => row.topic_id === args.topic);
    if (ofTopic.length === 0) return { error: `The topic "${args.topic}" has no proposed claims.` };
    ofTopic.forEach((row) => ids.add(row.id));
  }
  return { ids: [...ids] };
}
