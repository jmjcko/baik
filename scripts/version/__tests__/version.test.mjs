import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { BASELINE, commitType, formatVersion, isUnversioned, latestVersion, nextVersion, parseVersion, subjectOf } from '../version.mjs';

const BUMP = resolve('scripts/version/bump.mjs');

describe('the version that the next commit continues from', () => {
  it('should take the newest message that carries a version, so a merge or a squash without one does not send the number back to the baseline', () => {
    const messages = ['Merge branch x', 'feat: squashed on GitHub\n\nno trailer', 'fix: a\n\nVersion: 0.52.3', 'feat: b\n\nVersion: 0.51.0'];
    expect(latestVersion(messages)).toEqual({ major: 0, minor: 52, patch: 3 });
  });

  it('should be null when no message carries a version', () => {
    expect(latestVersion(['fix: a', 'docs: b'])).toBeNull();
    expect(latestVersion([])).toBeNull();
  });
});

describe('the rule of the version', () => {
  it('should raise the second number and restart the third for a function (feat), with or without a scope', () => {
    expect(formatVersion(nextVersion({ major: 0, minor: 48, patch: 7 }, 'feat: new thing'))).toBe('0.49.0');
    expect(formatVersion(nextVersion({ major: 0, minor: 48, patch: 7 }, 'feat(care): new thing'))).toBe('0.49.0');
    expect(formatVersion(nextVersion({ major: 0, minor: 48, patch: 7 }, 'feat(care)!: breaking'))).toBe('0.49.0');
  });

  it.each(['fix(auth): a bug', 'docs: a note', 'chore: x', 'refactor(ui): y', 'test: z', 'a message without a type'])('should raise only the third number for %j', (subject) => {
    expect(formatVersion(nextVersion({ major: 0, minor: 48, patch: 7 }, subject))).toBe('0.48.8');
  });

  it('should start from the baseline when no commit carries a version yet', () => {
    expect(formatVersion(nextVersion(null, 'feat: first'))).toBe('0.48.0');
    expect(formatVersion(nextVersion(null, 'fix: first'))).toBe('0.47.1');
    expect(BASELINE).toEqual({ major: 0, minor: 47, patch: 0 });
  });

  it('should read the version from a trailer and ignore a text that only looks like one', () => {
    expect(parseVersion('feat: x\n\nbody\n\nCo-Authored-By: A <a@b.c>\nVersion: 0.48.3\n')).toEqual({ major: 0, minor: 48, patch: 3 });
    expect(parseVersion('feat: x\n\nthe Version: 0.48.3 is mentioned in a sentence')).toBeNull();
    expect(parseVersion('feat: x')).toBeNull();
    expect(parseVersion(undefined)).toBeNull();
  });

  it('should find the type and the subject, and leave merges and fixups without a version', () => {
    expect(commitType('feat(a): b')).toBe('feat');
    expect(commitType('Add a thing')).toBeNull();
    expect(subjectOf('# comment\n\nfix: real subject\n\nbody')).toBe('fix: real subject');
    for (const subject of ['', 'Merge branch x', 'fixup! feat: a', 'squash! b', 'Revert "feat: c"']) expect(isUnversioned(subject)).toBe(true);
    expect(isUnversioned('feat: a')).toBe(false);
  });
});

/** Every case starts several `node` and `git` processes, which can pass the default 5 seconds when the whole suite runs with coverage. */
describe('the commit-msg hook in a real repository', { timeout: 30_000 }, () => {
  let dir;
  const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8', env: { ...process.env, GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t.t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t.t' } });
  const hook = (message) => {
    const file = join(dir, 'MSG');
    writeFileSync(file, message);
    execFileSync('node', [BUMP, file], { cwd: dir });
    return readFileSync(file, 'utf8');
  };
  const commit = (message) => {
    writeFileSync(join(dir, 'f.txt'), String(Math.random()));
    git('add', 'f.txt');
    git('commit', '-q', '-m', hook(message));
  };
  const last = () => parseVersion(git('log', '-1', '--format=%B'));

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'baik-version-'));
    git('init', '-q', '.');
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it('should add the trailer after the Co-Authored-By line, counting from the baseline', () => {
    const message = hook('feat(x): first function\n\nA body.\n\nCo-Authored-By: Claude <noreply@anthropic.com>\n');
    expect(message).toMatch(/Co-Authored-By: Claude <noreply@anthropic.com>\nVersion: 0\.48\.0\n$/);
  });

  it('should number the commits one after another: a function resets the third number', () => {
    commit('feat: one');
    expect(formatVersion(last())).toBe('0.48.0');
    commit('fix: a');
    commit('docs: b');
    expect(formatVersion(last())).toBe('0.48.2');
    commit('feat: two');
    expect(formatVersion(last())).toBe('0.49.0');
  });

  it('should not number a commit twice (an amend keeps its trailer) and should not number a merge', () => {
    commit('fix: a');
    const again = hook(git('log', '-1', '--format=%B'));
    expect(again.match(/Version:/g)).toHaveLength(1);
    expect(hook('Merge branch x')).not.toMatch(/Version:/);
  });
});
