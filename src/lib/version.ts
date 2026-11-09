/** What is running: the version from the commit message (`Version: x.y.z`), the commit and the day of the build. All three are set at build time by `next.config.ts`. */
export interface AppVersion {
  version: string;
  commit: string;
  built: string;
}

/** The numbers are written into the bundle at build time, so reading them is the same on the server and in the browser. */
export const APP_VERSION: AppVersion = {
  version: process.env.NEXT_PUBLIC_APP_VERSION || 'dev',
  commit: process.env.NEXT_PUBLIC_APP_COMMIT || '',
  built: process.env.NEXT_PUBLIC_APP_BUILT || '',
};

/** One line for people: `v0.48.0 · 223eab0 · 2026-11-09`; a build without a version (development) is only `dev`. */
export function formatVersion(info: AppVersion): string {
  if (info.version === 'dev') return 'dev';
  return [`v${info.version}`, info.commit, info.built].filter(Boolean).join(' · ');
}
