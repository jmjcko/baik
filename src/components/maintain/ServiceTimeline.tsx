import React from 'react';
import { Trash2 } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { chainVerdict } from '@/lib/engines/baikcare/chainWear';
import { priceText, valueText, workName } from '@/lib/service/describe';
import type { DrivetrainSpeeds } from '@/types/maintain';
import type { ServiceEntry } from '@/types/service';

interface TimelineProps {
  t: Translations;
  log: ServiceEntry[];
  drivetrain: DrivetrainSpeeds;
  onRemove: (id: string) => void;
}

/** The details under the name of the work: the number with the verdict of the chain, the price, the warranty and the note. */
function detailsOf(t: Translations, entry: ServiceEntry, drivetrain: DrivetrainSpeeds): string[] {
  const verdict = entry.kind === 'chain' && entry.value !== null ? chainVerdict(entry.value, drivetrain) : null;
  return [
    valueText(t.service, entry) + (verdict ? ` (${verdict === 'ok' ? t.service.log.chainOk : t.service.log.chainWorn})` : ''),
    priceText(t.service, entry),
    entry.warrantyUntil ? fill(t.service.log.warranty, { date: entry.warrantyUntil }) : '',
    entry.note,
  ].filter((part) => part !== '');
}

/** The service history as a timeline, newest first. */
export const ServiceTimeline: React.FC<TimelineProps> = ({ t, log, drivetrain, onRemove }) => {
  if (log.length === 0) return <p className="text-sm text-ink-2" data-testid="log-empty">{t.service.log.empty}</p>;
  return (
    <ol className="relative border-l-2 border-line ml-2 space-y-4" data-testid="log-timeline">
      {log.map((entry) => (
        <li key={entry.id} data-testid="log-entry" className="pl-5 relative">
          <span aria-hidden="true" className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-surface border-2 border-tone-info-line" />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="mono-chip text-xs text-ink-3">{entry.at}</p>
              <p className="text-sm font-semibold text-ink">{workName(t.service, entry)}</p>
              {detailsOf(t, entry, drivetrain).map((part) => <p key={part} className="text-xs text-ink-2 break-words">{part}</p>)}
            </div>
            <button type="button" onClick={() => onRemove(entry.id)} aria-label={fill(t.service.log.remove, { date: entry.at, work: workName(t.service, entry) })} data-testid="log-remove" className="h-9 w-9 shrink-0 rounded-full border border-line bg-surface text-ink-2 hover:bg-sunken inline-flex items-center justify-center"><Trash2 aria-hidden="true" className="w-4 h-4" /></button>
          </div>
        </li>
      ))}
    </ol>
  );
};
