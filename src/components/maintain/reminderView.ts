import { AlertTriangle, CheckCircle2, CircleDashed, Clock, type LucideIcon } from 'lucide-react';
import type { ReminderState } from '@/lib/notifications/reminderEngine';

/** Icon and tone of a reminder state: the text label always goes with them, so colour is never the only signal. */
export const REMINDER_VIEW: Record<ReminderState, { Icon: LucideIcon; tone: string }> = {
  ok: { Icon: CheckCircle2, tone: 'border-tone-success-line bg-tone-success-bg text-tone-success-ink' },
  soon: { Icon: Clock, tone: 'border-tone-warning-line bg-tone-warning-bg text-tone-warning-ink' },
  overdue: { Icon: AlertTriangle, tone: 'border-tone-danger-line bg-tone-danger-bg text-tone-danger-ink' },
  unknown: { Icon: CircleDashed, tone: 'border-line bg-sunken text-ink-2' },
};
