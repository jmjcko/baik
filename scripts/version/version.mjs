/**
 * The version of the app lives in the commit message as a trailer line `Version: 0.48.0`, written by the commit-msg hook.
 * The second number counts the functions (a commit of the type `feat`), the third counts the other commits since the last function.
 * A trailer in the message, not a file, because only the pre-commit hook can add a file to the commit and it does not know the message yet.
 */

/** The state of the repository when the rule started: 47 `feat` commits and none after the last one. */
export const BASELINE = { major: 0, minor: 47, patch: 0 };

const TRAILER = /^Version:[ \t]*(\d+)\.(\d+)\.(\d+)[ \t]*$/m;
const TYPE = /^(\w+)(?:\([^)]*\))?!?:/;

/** The version that a commit message carries, or null. */
export function parseVersion(message) {
  const found = TRAILER.exec(message ?? '');
  return found ? { major: Number(found[1]), minor: Number(found[2]), patch: Number(found[3]) } : null;
}

export const formatVersion = ({ major, minor, patch }) => `${major}.${minor}.${patch}`;

/** The newest of the messages (newest first) that carries a version, or null: a merge or a squash on GitHub has none, and the number must go on from the commit before it. */
export function latestVersion(messages) {
  for (const message of messages) {
    const found = parseVersion(message);
    if (found) return found;
  }
  return null;
}

/** The type of a commit by the first line (`feat(care): ...` is `feat`), or null when the line has none. */
export function commitType(subject) {
  return TYPE.exec(subject ?? '')?.[1] ?? null;
}

/** A commit that carries no version of its own: a merge, a fixup that will be squashed, or an empty message. */
export function isUnversioned(subject) {
  return !subject || /^(Merge |Revert "|fixup!|squash!)/.test(subject);
}

/** A function (`feat`) raises the second number and starts the third again; every other commit raises the third. */
export function nextVersion(previous, subject) {
  const base = previous ?? BASELINE;
  return commitType(subject) === 'feat' ? { ...base, minor: base.minor + 1, patch: 0 } : { ...base, patch: base.patch + 1 };
}

/** The first line of a message that is not a comment (an editor message starts with the lines of git that begin with `#`). */
export function subjectOf(message) {
  return (message ?? '').split('\n').find((line) => line.trim() !== '' && !line.startsWith('#'))?.trim() ?? '';
}
