'use client';

import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { cx } from '@/lib/classNames';
import { SurfaceCard } from '@/components/primitives/SurfaceCard';
import { barTapeAlert } from '@/lib/engines/baikcare/barTape';
import type { BikeCare } from '@/types/maintain';
import { STATUS_VIEW } from './statusView';

interface TrainerProps {
  t: Translations;
  care: BikeCare;
  today: string;
  onChange: (patch: Partial<BikeCare>) => void;
}

/** The warning under the date: due after six months, a request for the date when it is missing, a calm note otherwise. */
const TapeNotice: React.FC<Omit<TrainerProps, 'onChange'>> = ({ t, care, today }) => {
  if (!care.trainer) return <p className="text-sm text-ink-2">{t.care.trainer.off}</p>;
  const alert = barTapeAlert(care, today);
  if (alert === 'due') {
    const { tone } = STATUS_VIEW.warn;
    return <p role="alert" data-testid="tape-due" className={cx('rounded-xl border-2 p-4 text-sm flex gap-3', tone)}><AlertTriangle aria-hidden="true" className="w-5 h-5 shrink-0" />{t.care.trainer.due}</p>;
  }
  return <p role="status" data-testid={alert === 'unknown' ? 'tape-unknown' : 'tape-fine'} className="text-sm text-ink-2 flex gap-2"><Info aria-hidden="true" className="w-4 h-4 shrink-0 mt-0.5" />{alert === 'unknown' ? t.care.trainer.unknown : t.care.trainer.fine}</p>;
};

/** The indoor trainer switch of the bike and the age of its handlebar tape (KB bAIkcare 4). */
export const TrainerCare: React.FC<TrainerProps> = (props) => {
  const { t, care, onChange } = props;
  return (
    <SurfaceCard as="section" className="space-y-4" testId="trainer-care">
      <div>
        <h2 className="text-lg font-bold text-ink tracking-tight">{t.care.trainer.title}</h2>
        <p className="text-sm text-ink-2 leading-relaxed mt-1">{t.care.trainer.intro}</p>
      </div>
      <label className="flex items-center gap-3 text-sm text-ink">
        <input type="checkbox" checked={care.trainer} onChange={(e) => onChange({ trainer: e.target.checked })} data-testid="trainer-switch" className="h-4 w-4 accent-blue-600" />
        {t.care.trainer.switchLabel}
      </label>
      {care.trainer && (
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-ink-2">{t.care.trainer.tapeLabel}</span>
          <input type="date" value={care.barTapeAt ?? ''} max={props.today} onChange={(e) => onChange({ barTapeAt: e.target.value === '' ? null : e.target.value })} data-testid="tape-date" className="h-12 rounded-xl border border-line bg-surface px-4 text-sm text-ink" />
          <span className="block text-xs text-ink-3">{t.care.trainer.tapeHint}</span>
        </label>
      )}
      <TapeNotice t={t} care={care} today={props.today} />
    </SurfaceCard>
  );
};
