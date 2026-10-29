'use client';

import React, { useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { cx } from '@/lib/classNames';
import { SurfaceCard } from '@/components/primitives/SurfaceCard';
import { chainStatus, chainVerdict, parseChainWear } from '@/lib/engines/baikcare/chainWear';
import { DRIVETRAIN_SPEEDS, type BikeCare } from '@/types/maintain';
import { STATUS_VIEW } from './statusView';

interface TrackerProps {
  t: Translations;
  care: BikeCare;
  onChange: (patch: Partial<BikeCare>) => void;
}

const FIELD = 'h-12 w-40 rounded-xl border border-line bg-surface px-4 text-sm text-ink focus:outline-none focus:border-tone-info-line';

/** The number of speeds decides where the limits are (KB bAIkcare 2.2). */
const SpeedsSwitch: React.FC<TrackerProps> = ({ t, care, onChange }) => (
  <fieldset className="space-y-1">
    <legend className="text-xs font-semibold text-ink-2">{t.care.chain.speedsLabel}</legend>
    <div className="flex flex-wrap gap-2">
      {DRIVETRAIN_SPEEDS.map((speeds) => (
        <button key={speeds} type="button" aria-pressed={care.drivetrain === speeds} onClick={() => onChange({ drivetrain: speeds })} data-testid={`chain-speeds-${speeds}`} className={cx('h-10 px-4 rounded-full text-xs font-semibold border transition-colors', care.drivetrain === speeds ? 'bg-blue-600 border-blue-600 text-slate-50' : 'border-line bg-surface text-ink-2 hover:bg-sunken')}>
          {t.care.chain.speeds[speeds]}
        </button>
      ))}
    </div>
  </fieldset>
);

/** The reading as the rider types it: it is stored once it is a plausible number, and an empty field means "not measured". */
const ReadingField: React.FC<TrackerProps> = ({ t, care, onChange }) => {
  const [text, setText] = useState(care.chainWearPct === null ? '' : String(care.chainWearPct));
  const invalid = text.trim() !== '' && parseChainWear(text) === null;
  const edit = (next: string) => {
    setText(next);
    if (next.trim() === '') onChange({ chainWearPct: null });
    else if (parseChainWear(next) !== null) onChange({ chainWearPct: parseChainWear(next) });
  };
  return (
    <label className="block space-y-1">
      <span className="text-xs font-semibold text-ink-2">{t.care.chain.readingLabel}</span>
      <input type="text" inputMode="decimal" value={text} onChange={(e) => edit(e.target.value)} aria-invalid={invalid} aria-describedby="chain-hint" data-testid="chain-reading" className={FIELD} />
      <span id="chain-hint" className="block text-xs text-ink-3">{t.care.chain.readingHint}</span>
      {invalid && <span role="alert" className="block text-sm text-tone-danger-ink">{t.care.chain.invalid}</span>}
    </label>
  );
};

const Verdict: React.FC<TrackerProps> = ({ t, care }) => {
  const verdict = chainVerdict(care.chainWearPct, care.drivetrain);
  if (!verdict) return <p className="text-sm text-ink-2" data-testid="chain-empty">{t.care.chain.empty}</p>;
  const status = chainStatus(verdict);
  const { Icon, tone } = STATUS_VIEW[status];
  const texts = t.care.chain.verdicts[verdict];
  return (
    <div role="status" data-testid="chain-verdict" data-verdict={verdict} className={cx('rounded-xl border-2 p-4 flex gap-3', tone)}>
      <Icon aria-hidden="true" className="w-5 h-5 shrink-0 mt-0.5" />
      <div>
        <p className="font-bold">{t.care.verdictLabel[status as 'pass']} · {texts.title}</p>
        <p className="text-sm mt-1">{texts.body}</p>
      </div>
    </div>
  );
};

/** The chain gauge: the reading and the number of speeds give the verdict of the knowledge base. */
export const ChainTracker: React.FC<TrackerProps> = (props) => (
  <SurfaceCard as="section" className="space-y-4" testId="chain-tracker">
    <div>
      <h2 className="text-lg font-bold text-ink tracking-tight">{props.t.care.chain.title}</h2>
      <p className="text-sm text-ink-2 leading-relaxed mt-1">{props.t.care.chain.intro}</p>
    </div>
    <SpeedsSwitch {...props} />
    <ReadingField {...props} />
    <Verdict {...props} />
  </SurfaceCard>
);
