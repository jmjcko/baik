'use client';

import React, { useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { SurfaceCard } from '@/components/primitives/SurfaceCard';
import { SERVICE_KINDS, type ServiceEntry, type ServiceKind } from '@/types/service';
import type { DrivetrainSpeeds } from '@/types/maintain';
import { QuickEntryDialog } from './QuickEntryDialog';
import { ServiceTimeline } from './ServiceTimeline';

interface LogProps {
  t: Translations;
  locale: 'en' | 'cs';
  log: ServiceEntry[];
  drivetrain: DrivetrainSpeeds;
  today: string;
  onAdd: (entry: ServiceEntry) => void;
  onRemove: (id: string) => void;
}

/** The service book: five quick entries and the timeline of what was done. */
export const ServiceHistoryLog: React.FC<LogProps> = ({ t, locale, log, drivetrain, today, onAdd, onRemove }) => {
  const [kind, setKind] = useState<ServiceKind | null>(null);
  const l = t.service.log;
  return (
    <SurfaceCard as="section" className="space-y-5" padding="lg" testId="service-log">
      <div id="care-log">
        <h2 className="text-lg font-bold text-ink tracking-tight">{l.title}</h2>
        <p className="text-sm text-ink-2 leading-relaxed mt-1">{l.intro}</p>
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label={l.title}>
        {SERVICE_KINDS.map((id) => (
          <button key={id} type="button" onClick={() => setKind(id)} data-testid={`log-quick-${id}`} className="min-h-12 px-5 py-2 rounded-full border border-line bg-surface text-left hover:bg-sunken transition-colors">
            <span className="block text-sm font-semibold text-ink">{l.quick[id].title}</span>
            <span className="block text-xs text-ink-3">{l.quick[id].hint}</span>
          </button>
        ))}
      </div>
      <ServiceTimeline t={t} log={log} drivetrain={drivetrain} onRemove={onRemove} />
      <p className="text-xs text-ink-3">{l.careNote}</p>
      {kind && <QuickEntryDialog t={t} locale={locale} kind={kind} today={today} onSave={(entry) => { onAdd(entry); setKind(null); }} onClose={() => setKind(null)} />}
    </SurfaceCard>
  );
};
