import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { formatVersion, isUnversioned, latestVersion, nextVersion, parseVersion, subjectOf } from './version.mjs';

/** How far back the number is looked for: enough to pass over merges and squashes that carry none. */
const LOOK_BACK = 100;

/** The messages of the last commits, newest first, or [] in a repository that has none yet. */
function recentMessages() {
  try {
    return execFileSync('git', ['log', `-${LOOK_BACK}`, '--format=%B%x00'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).split('\0');
  } catch {
    return [];
  }
}

/**
 * The commit-msg hook: adds the line `Version: x.y.z` to the message of the commit that is being made.
 * A message that has the line already (an amend) is left alone, and so is a merge, so the number moves once per commit.
 */
function main(file) {
  const message = readFileSync(file, 'utf8');
  if (parseVersion(message) || isUnversioned(subjectOf(message))) return;
  const version = formatVersion(nextVersion(latestVersion(recentMessages()), subjectOf(message)));
  execFileSync('git', ['interpret-trailers', '--in-place', '--if-exists', 'doNothing', '--trailer', `Version: ${version}`, file]);
}

if (process.argv[2]) main(process.argv[2]);
