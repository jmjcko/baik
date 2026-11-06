import React from 'react';
import { cx } from '@/lib/classNames';

export type ServiceTone = 'success' | 'info' | 'warning' | 'neutral';

const TONE: Record<ServiceTone, string> = {
  success: 'border-tone-success-line bg-tone-success-bg text-tone-success-ink',
  info: 'border-tone-info-line bg-tone-info-bg text-tone-info-ink',
  warning: 'border-tone-warning-line bg-tone-warning-bg text-tone-warning-ink',
  neutral: 'border-field-line bg-sunken text-ink-2',
};

/** The state of a service as a chip with words (the meaning never depends on the color only). */
export const ServiceState: React.FC<{ label: string; tone: ServiceTone; testId: string }> = ({ label, tone, testId }) => (
  <span role="status" data-testid={testId} className={cx('inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold', TONE[tone])}>{label}</span>
);
