import React from 'react';
import { AlertTriangle, Droplets, Wrench, type LucideIcon } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import type { WearAlert } from '@/lib/engines/baikcare/wearEngine';
import { isScored, percentOf } from './logbookView';

interface BannerProps {
  t: Translations;
  alert: WearAlert;
  /** Marks the part as done today; missing for the stretched chain (the Workshop replaces it). */
  onDone?: () => void;
}

interface Look {
  Icon: LucideIcon;
  tone: string;
  title: string;
  body: string;
}

/** What a notice says and how it looks: a safety part that is due is red, a routine job and the rain advice are amber. */
function lookOf(t: Translations, alert: WearAlert): Look {
  const l = t.service.logbook;
  if (alert.kind === 'wetRide') return { Icon: Droplets, tone: 'border-tone-warning-line bg-tone-warning-bg text-tone-warning-ink', title: l.parts.chainLube.action, body: fill(l.notices.wet, { km: Math.round(alert.km) }) };
  const part = l.parts[alert.component];
  const safety = isScored(alert.component);
  return {
    Icon: safety ? AlertTriangle : Wrench,
    tone: safety ? 'border-tone-danger-line bg-tone-danger-bg text-tone-danger-ink' : 'border-tone-warning-line bg-tone-warning-bg text-tone-warning-ink',
    title: part.action,
    body: alert.component === 'chainStretch' ? l.notices.stretch : fill(l.notices.reached, { percent: percentOf(alert.wear) }),
  };
}

/** A notice of the logbook: the rain advice for the chain, a routine job that is due or a safety part that reached its interval. */
export const MaintenanceAlertBanner: React.FC<BannerProps> = ({ t, alert, onDone }) => {
  const { Icon, tone, title, body } = lookOf(t, alert);
  return (
    <li data-testid={alert.kind === 'wetRide' ? 'notice-wet' : `notice-${alert.component}`} className={`flex flex-wrap items-center gap-3 rounded-xl border p-4 ${tone}`}>
      <Icon aria-hidden="true" className="w-5 h-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">{title}</p>
        <p className="text-xs">{body}</p>
      </div>
      {onDone && <button type="button" onClick={onDone} className="h-8 px-4 rounded-full text-xs font-semibold border border-current bg-surface text-ink hover:bg-sunken">{t.service.logbook.card.markDone}</button>}
    </li>
  );
};
