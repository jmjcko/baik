import { AlertTriangle, CheckCircle2, CircleDashed, XCircle, type LucideIcon } from 'lucide-react';
import type { NodeStatus } from '@/types/maintain';

interface StatusView {
  Icon: LucideIcon;
  /** The tone of a node bubble, a chip or a verdict card (tokens of the design system, no fixed colours). */
  tone: string;
}

/** Grey is not checked, green is in order, orange is a warning and red needs action; the icon and the text say it too, so colour is never the only signal. */
export const STATUS_VIEW: Record<NodeStatus, StatusView> = {
  unchecked: { Icon: CircleDashed, tone: 'border-line bg-sunken text-ink-2' },
  pass: { Icon: CheckCircle2, tone: 'border-tone-success-line bg-tone-success-bg text-tone-success-ink' },
  warn: { Icon: AlertTriangle, tone: 'border-tone-warning-line bg-tone-warning-bg text-tone-warning-ink' },
  fail: { Icon: XCircle, tone: 'border-tone-danger-line bg-tone-danger-bg text-tone-danger-ink' },
};
