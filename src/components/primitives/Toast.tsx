import React from 'react';
import { cx } from '@/lib/classNames';

export interface ToastProps {
  tone: 'success' | 'danger';
  title: string;
  detail?: string;
  dismissLabel: string;
  onDismiss: () => void;
  /** Renders in the page flow instead of fixed at the bottom of the screen (component showcase). */
  inline?: boolean;
}

const TONES: Record<ToastProps['tone'], string> = {
  success: 'border-tone-success-line text-tone-success-ink',
  danger: 'border-tone-danger-line text-tone-danger-ink',
};

/** Non-blocking confirmation at the bottom of the screen; success is a polite status, failure an alert. */
export const Toast: React.FC<ToastProps> = ({ tone, title, detail, dismissLabel, onDismiss, inline }) => (
  <div
    role={tone === 'danger' ? 'alert' : 'status'}
    aria-live={tone === 'danger' ? 'assertive' : 'polite'}
    className={cx(
      inline ? 'w-full max-w-lg' : 'fixed bottom-6 left-1/2 z-50 -translate-x-1/2 w-[min(92vw,34rem)]',
      'rounded-2xl border bg-surface p-4 shadow-lg flex items-start justify-between gap-4',
      TONES[tone]
    )}
  >
    <div className="space-y-1">
      <p className="text-sm font-bold">{title}</p>
      {detail && <p className="text-xs font-mono text-ink-2 leading-relaxed">{detail}</p>}
    </div>
    <button type="button" onClick={onDismiss} className="shrink-0 text-xs font-semibold text-ink-2 underline hover:text-ink">
      {dismissLabel}
    </button>
  </div>
);
