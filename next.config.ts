import { execFileSync } from 'node:child_process';
import type { NextConfig } from 'next';
import { parseVersion, formatVersion } from './scripts/version/version.mjs';

/** The output of one git command, or '' when git is not there (a build from an archive). */
function git(...args: string[]): string {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
}

/** The version of this build from the message of its commit: Vercel hands the message over, a local build asks git. */
function versionOfBuild(): string {
  const found = parseVersion(process.env.VERCEL_GIT_COMMIT_MESSAGE ?? git('log', '-1', '--format=%B'));
  return found ? formatVersion(found) : 'dev';
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // `next dev` would append its own rules to AGENTS.md, which is owned by the product owner.
  agentRules: false,
  // The dev-server indicator would cover the sidebar footer in the bottom left corner (development only).
  devIndicators: { position: 'bottom-right' },
  // The knowledge base (docs/knowledge) is read from disk by server actions; make sure it ships with them.
  outputFileTracingIncludes: {
    '/**': ['./docs/knowledge/*.md'],
  },
  // Which version runs (shown in the sidebar and at /api/version): the version of the commit, the commit and the day of the build.
  env: {
    NEXT_PUBLIC_APP_VERSION: versionOfBuild(),
    NEXT_PUBLIC_APP_COMMIT: (process.env.VERCEL_GIT_COMMIT_SHA ?? git('rev-parse', 'HEAD')).slice(0, 7),
    NEXT_PUBLIC_APP_BUILT: new Date().toISOString().slice(0, 10),
  },
};

export default nextConfig;
