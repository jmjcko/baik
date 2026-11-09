import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { formatVersion, isUnversioned, nextVersion, parseVersion, subjectOf } from './version.mjs';

/** The message of the last commit, or '' in a repository that has none yet. */
function parentMessage() {
  try {
    return execFileSync('git', ['log', '-1', '--format=%B'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return '';
  }
}

/**
 * The commit-msg hook: adds the line `Version: x.y.z` to the message of the commit that is being made.
 * A message that has the line already (an amend) is left alone, and so is a merge, so the number moves once per commit.
 */
function main(file) {
  const message = readFileSync(file, 'utf8');
  if (parseVersion(message) || isUnversioned(subjectOf(message))) return;
  const version = formatVersion(nextVersion(parseVersion(parentMessage()), subjectOf(message)));
  execFileSync('git', ['interpret-trailers', '--in-place', '--if-exists', 'doNothing', '--trailer', `Version: ${version}`, file]);
}

if (process.argv[2]) main(process.argv[2]);
