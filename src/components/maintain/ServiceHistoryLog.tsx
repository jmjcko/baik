import React from 'react';
import { Plus } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { SurfaceCard } from '@/components/primitives/SurfaceCard';
import { totalsByCurrency } from '@/lib/service/quickLog';
import { SERVICE_KINDS, type ServiceEntry, type ServiceKind } from '@/types/service';
import type { DrivetrainSpeeds } from '@/types/maintain';
import { ServiceTimeline } from './ServiceTimeline';

interface LogProps {
  t: Translations;
  log: ServiceEntry[];
  drivetrain: DrivetrainSpeeds;
  onQuick: (kind: ServiceKind) => void;
  onRemove: (id: string) => void;
}

const QuickEntries: React.FC<Pick<LogProps, 't' | 'onQuick'>> = ({ t, onQuick }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" role="group" aria-label={t.service.log.title}>
    {SERVICE_KINDS.map((id) => (
      <button key={id} type="button" onClick={() => onQuick(id)} data-testid={`log-quick-${id}`} className="min-h-24 p-4 rounded-2xl border border-line bg-surface text-left hover:bg-tone-info-bg hover:border-tone-info-line transition-colors flex flex-col gap-1.5">
        <span className="flex items-start justify-between gap-2 text-sm font-bold text-ink">{t.service.log.quick[id].title}<Plus aria-hidden="true" className="w-4 h-4 shrink-0 text-accent-ink" /></span>
        <span className="text-xs text-ink-3">{t.service.log.quick[id].hint}</span>
      </button>
    ))}
  </div>
);

/** The Service log tab: five big quick entries and the history of what was done, with the total cost. */
export const ServiceHistoryLog: React.FC<LogProps> = ({ t, log, drivetrain, onQuick, onRemove }) => {
  const l = t.service.log;
  const totals = totalsByCurrency(log).map(({ currency, total }) => `${total} ${l.currencies[currency]}`);
  return (
    <div className="space-y-6" id="care-log">
      <SurfaceCard as="section" className="space-y-4" padding="lg" testId="service-log">
        <div>
          <h2 className="text-lg font-bold text-ink tracking-tight">{l.title}</h2>
          <p className="text-sm text-ink-2 leading-relaxed mt-1">{l.intro}</p>
        </div>
        <QuickEntries t={t} onQuick={onQuick} />
      </SurfaceCard>
      <SurfaceCard as="section" className="space-y-3" padding="lg" testId="service-history">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-bold text-ink tracking-tight">{t.service.certificate.historyTitle}</h2>
          {totals.length > 0 && <p className="text-xs font-semibold text-ink-2" data-testid="log-total">{t.service.certificate.totalLabel}: {totals.join(', ')}</p>}
        </div>
        <ServiceTimeline t={t} log={log} drivetrain={drivetrain} onRemove={onRemove} />
        <p className="text-xs text-ink-3">{l.careNote}</p>
      </SurfaceCard>
    </div>
  );
};
