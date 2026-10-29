import React from 'react';
import { Info } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { cx } from '@/lib/classNames';
import { SurfaceCard } from '@/components/primitives/SurfaceCard';
import { sealantAlert, sealantWindow } from '@/lib/engines/baikcare/sealant';
import { pressureGuide, tyreCategory } from '@/lib/engines/baikcare/tyrePressure';
import type { RidingDiscipline } from '@/types/baikfit';
import type { BikeCare } from '@/types/maintain';
import { STATUS_VIEW } from './statusView';

export interface WheelsCardProps {
  t: Translations;
  care: BikeCare;
  discipline: RidingDiscipline;
  riderWeightKg: number;
  today: string;
  onChange: (patch: Partial<BikeCare>) => void;
  onOpenFlat: () => void;
}

const PILL = 'h-10 px-4 rounded-full text-xs font-semibold border transition-colors';

/** Tubes or tubeless: the rider says which, because only tubeless tyres have sealant. */
const SetupSwitch: React.FC<Pick<WheelsCardProps, 't' | 'care' | 'onChange'>> = ({ t, care, onChange }) => (
  <div role="group" aria-label={t.wheels.setup.label} className="flex flex-wrap gap-2">
    {([false, true] as const).map((tubeless) => (
      <button key={String(tubeless)} type="button" aria-pressed={care.tubeless === tubeless} onClick={() => onChange({ tubeless })} data-testid={`tyre-setup-${tubeless ? 'tubeless' : 'tube'}`} className={cx(PILL, care.tubeless === tubeless ? 'bg-blue-600 border-blue-600 text-slate-50' : 'border-line bg-surface text-ink-2 hover:bg-sunken')}>
        {tubeless ? t.wheels.setup.tubeless : t.wheels.setup.tube}
      </button>
    ))}
  </div>
);

/** What the age of the sealant asks for: a calm note, the top-up window, or a warning. */
const SealantNotice: React.FC<Pick<WheelsCardProps, 't' | 'care' | 'today'>> = ({ t, care, today }) => {
  const s = t.wheels.sealant;
  const alert = sealantAlert(care, today);
  if (alert === 'topUp' || alert === 'overdue') {
    const view = STATUS_VIEW[alert === 'topUp' ? 'warn' : 'fail'];
    return <p role="alert" data-testid={alert === 'topUp' ? 'sealant-topup' : 'sealant-overdue'} className={cx('rounded-xl border-2 p-4 text-sm flex gap-3', view.tone)}><view.Icon aria-hidden="true" className="w-5 h-5 shrink-0" />{alert === 'topUp' ? s.topUp : s.overdue}</p>;
  }
  return <p role="status" data-testid={alert === 'unknown' ? 'sealant-unknown' : 'sealant-fresh'} className="text-sm text-ink-2 flex gap-2"><Info aria-hidden="true" className="w-4 h-4 shrink-0 mt-0.5" />{alert === 'unknown' ? s.unknown : s.fresh}</p>;
};

/** The sealant of tubeless tyres: the day it was topped up and the 3 to 6 month window (KB bAIkcare v1.1.0). */
const SealantBlock: React.FC<Pick<WheelsCardProps, 't' | 'care' | 'today' | 'onChange'>> = ({ t, care, today, onChange }) => {
  const s = t.wheels.sealant;
  if (!care.tubeless) return <p className="text-sm text-ink-2" data-testid="sealant-off">{s.off}</p>;
  const window = sealantWindow(care.sealantAt);
  return (
    <div className="space-y-3">
      <label className="block space-y-1">
        <span className="text-xs font-semibold text-ink-2">{s.dateLabel}</span>
        <input type="date" value={care.sealantAt ?? ''} max={today} onChange={(e) => onChange({ sealantAt: e.target.value === '' ? null : e.target.value })} data-testid="sealant-date" className="h-12 rounded-xl border border-line bg-surface px-4 text-sm text-ink" />
        <span className="block text-xs text-ink-3">{s.hint}</span>
      </label>
      {window && <p className="text-xs font-mono text-ink-2" data-testid="sealant-window">{fill(s.window, window)}</p>}
      <SealantNotice t={t} care={care} today={today} />
    </div>
  );
};

/** The usual pressure of the reference tyre of the bike and the point in it that follows the weight of the rider. */
const PressureBlock: React.FC<Pick<WheelsCardProps, 't' | 'discipline' | 'riderWeightKg'>> = ({ t, discipline, riderWeightKg }) => {
  const p = t.wheels.pressure;
  const guide = pressureGuide(tyreCategory(discipline), riderWeightKg);
  return (
    <div className="space-y-1.5 text-sm" data-testid="pressure-guide">
      <p className="text-ink-2">{p.intro}</p>
      <p className="text-xs font-bold uppercase tracking-wider text-ink-3">{fill(p.reference, { tyre: p.categories[guide.category] })}</p>
      <p className="font-mono text-ink" data-testid="pressure-range">{fill(p.range, { min: guide.minBar.toFixed(1), max: guide.maxBar.toFixed(1) })}</p>
      <p className="font-semibold text-ink" data-testid="pressure-yours">{fill(p.yours, { kg: riderWeightKg, bar: guide.bar.toFixed(1) })}</p>
      <p className="text-xs text-ink-3">{p.weightNote}</p>
      <p className="text-xs text-ink-3">{p.otherWidth}</p>
    </div>
  );
};

/** The checks that tell a worn or damaged tyre or rim: the criteria are fixed, the rider looks and decides. */
const WearList: React.FC<{ t: Translations }> = ({ t }) => (
  <div className="space-y-2" data-testid="wear-list">
    <p className="text-sm text-ink-2">{t.wheels.wear.intro}</p>
    <ul className="space-y-2">
      {t.wheels.wear.items.map((item) => (
        <li key={item.title} className="rounded-xl border border-line p-3 text-sm">
          <span><span className="font-semibold text-ink">{item.title}: </span><span className="text-ink-2 leading-relaxed">{item.body}</span></span>
        </li>
      ))}
    </ul>
  </div>
);

const Heading: React.FC<{ children: string }> = ({ children }) => <h3 className="text-xs font-bold uppercase tracking-wider text-ink-3 mb-2">{children}</h3>;

/** The way into the flat repair guide, with a line about what it covers. */
const FlatEntry: React.FC<{ t: Translations; onOpen: () => void }> = ({ t, onOpen }) => (
  <div className="rounded-xl border border-line p-4 flex flex-wrap items-center justify-between gap-3">
    <div>
      <p className="font-bold text-ink">{t.wheels.flat.title}</p>
      <p className="text-sm text-ink-2 mt-0.5">{t.wheels.flat.openHint}</p>
    </div>
    <button type="button" onClick={onOpen} data-testid="flat-open" className="h-12 px-6 rounded-full bg-blue-600 text-slate-50 text-sm font-semibold hover:bg-blue-700 transition-colors">{t.wheels.flat.open}</button>
  </div>
);

/** The wheels and tyres card of bAIkcare: the tyre system and the sealant, the pressure, the wear checks and the way to the flat repair guide. */
export const WheelsTyresCard: React.FC<WheelsCardProps> = (props) => {
  const { t, care, today, onChange } = props;
  return (
    <SurfaceCard as="section" padding="lg" className="space-y-6" testId="wheels-card">
      <div>
        <h2 className="text-lg font-bold text-ink tracking-tight">{t.wheels.title}</h2>
        <p className="text-sm text-ink-2 leading-relaxed mt-1">{t.wheels.intro}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Heading>{t.wheels.sealant.title}</Heading>
          <SetupSwitch t={t} care={care} onChange={onChange} />
          <SealantBlock t={t} care={care} today={today} onChange={onChange} />
        </div>
        <div>
          <Heading>{t.wheels.pressure.title}</Heading>
          <PressureBlock t={t} discipline={props.discipline} riderWeightKg={props.riderWeightKg} />
        </div>
      </div>
      <div>
        <Heading>{t.wheels.wear.title}</Heading>
        <WearList t={t} />
      </div>
      <FlatEntry t={t} onOpen={props.onOpenFlat} />
    </SurfaceCard>
  );
};
