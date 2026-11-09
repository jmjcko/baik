import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { APP_VERSION, formatVersion, type AppVersion } from '@/lib/version';
import { cx } from '@/lib/classNames';

interface VersionLineProps {
  t: Translations;
  /** The text colour: the sidebar is dark in both themes, the pages are not. */
  className?: string;
  info?: AppVersion;
}

/** Which version is running, in small monospace text: the number, the commit and the day of the build. */
export const VersionLine: React.FC<VersionLineProps> = ({ t, className = 'text-ink-3', info = APP_VERSION }) => (
  <p data-testid="app-version" title={`${t.navigation.versionLabel}: ${formatVersion(info)}`} className={cx('font-mono text-[11px] leading-snug truncate', className)}>
    {t.navigation.versionLabel} {formatVersion(info)}
  </p>
);
