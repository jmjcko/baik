import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { cx } from '@/lib/classNames';
import { JOURNEY_STEPS } from '@/lib/hooks/useJourney';
import type { BikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import type { HamstringLevel, ReleaseResult } from '@/lib/engines/baikfit/mobility';
import { SurfaceCard } from '@/components/primitives/SurfaceCard';
import { BikeCadWireframe } from '@/components/studio/BikeCadWireframe';
import { bikeTitle } from '@/components/profile/GarageSection';
import type { BikeProfile } from '@/lib/passport/types';

const PILL = 'h-12 px-6 rounded-full text-sm font-semibold transition-colors';
const PILL_PRIMARY = `${PILL} bg-blue-600 text-slate-50 hover:bg-blue-700`;
const PILL_OUTLINE = `${PILL} border border-line bg-surface text-ink hover:bg-sunken`;

interface HeroProps {
  t: Translations;
  /** The setup guide was finished once: its steps are shown as done. */
  setupDone: boolean;
  onStart: () => void;
  onCheckBike: () => void;
}

/** The steps of the setup guide as a numbered list (checked when the guide was finished), so the card says what the rider is about to do. */
const GuideSteps: React.FC<{ t: Translations; done: boolean }> = ({ t, done }) => (
  <div>
    <h3 className="text-xs font-mono uppercase tracking-wider text-ink-3 mb-2">{t.shell.dashboard.hero.stepsTitle}</h3>
    <ol className="space-y-2" data-testid="hero-steps">
      {JOURNEY_STEPS.map((step, index) => (
        <li key={step} className="flex items-center gap-3 text-sm text-ink">
          <span aria-hidden="true" className={cx('w-6 h-6 shrink-0 rounded-full border text-[11px] font-mono font-bold flex items-center justify-center', done ? 'border-tone-success-line bg-tone-success-bg text-tone-success-ink' : 'border-line bg-sunken text-ink-2')}>{done ? '✓' : index + 1}</span>
          {t.navigation.journeySteps[step]}
        </li>
      ))}
    </ol>
  </div>
);

/** The call to action in the same white M3 container as the other cards: a softly tinted head, the text and a strong primary button. */
export const HeroCard: React.FC<HeroProps> = ({ t, setupDone, onStart, onCheckBike }) => {
  const h = t.shell.dashboard.hero;
  return (
    <SurfaceCard as="section" testId="hero" padding="none" className="overflow-hidden flex flex-col">
      <div className="px-5 py-4 bg-tone-info-bg border-b border-tone-info-line">
        <h2 className="text-xl font-extrabold tracking-tight text-ink">{h.title}</h2>
      </div>
      <div className="p-5 flex flex-col justify-between gap-6 flex-1">
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-ink-2">{h.text}</p>
          <GuideSteps t={t} done={setupDone} />
        </div>
        <div className="flex flex-col gap-3">
          <button type="button" onClick={onStart} className={PILL_PRIMARY}>{h.start}</button>
          <button type="button" onClick={onCheckBike} className={PILL_OUTLINE}>{h.checkBike}</button>
        </div>
      </div>
    </SurfaceCard>
  );
};

/** The CAD drawing of the active bike from its target numbers (only after the setup guide was finished). */
export const OverviewCard: React.FC<{ t: Translations; coordinates: BikeFitCoordinates; crankLengthMm: number; setupDone: boolean; mtb?: boolean }> = ({ t, coordinates, crankLengthMm, setupDone, mtb = false }) => (
  <SurfaceCard as="section" testId="overview">
    <h2 className="text-base font-bold text-ink">{t.shell.dashboard.overview.title}</h2>
    <p className="text-xs text-ink-2 mt-1 mb-4">{t.shell.dashboard.overview.subtitle}</p>
    {setupDone ? <BikeCadWireframe coordinates={coordinates} crankLengthMm={crankLengthMm} t={t.studio} compact mtb={mtb} /> : <p className="text-sm text-ink-3 py-10 text-center">{t.shell.dashboard.overview.empty}</p>}
  </SurfaceCard>
);

interface GarageCardProps {
  t: Translations;
  bikes: BikeProfile[];
  authenticated: boolean;
  onSwitchBike: (bikeId: string) => void;
  onManage: () => void;
}

/** The bikes of the garage, the active one marked; a signed in rider can open the garage of the profile. */
export const GarageCard: React.FC<GarageCardProps> = ({ t, bikes, authenticated, onSwitchBike, onManage }) => {
  const g = t.shell.dashboard.garage;
  return (
    <SurfaceCard as="section" testId="dashboard-garage" className="space-y-3">
      <div>
        <h2 className="text-base font-bold text-ink">{g.title}</h2>
        <p className="text-xs text-ink-2 mt-1">{g.text}</p>
      </div>
      <ul className="space-y-2">
        {bikes.map((bike) => (
          <li key={bike.id} data-testid="dashboard-bike" className={cx('p-3 rounded-xl border flex items-center justify-between gap-3', bike.isActive ? 'border-tone-success-line bg-tone-success-bg' : 'border-line bg-surface')}>
            <div className="min-w-0">
              <p className="text-sm font-bold text-ink truncate">{bikeTitle(t.profile.garage, bike)}</p>
              <p className="text-xs text-ink-2">{bike.isStock ? g.factory : g.ownSetup}</p>
            </div>
            {bike.isActive ? <span className="text-[11px] font-mono uppercase tracking-wider text-tone-success-ink">{g.active}</span> : <button type="button" onClick={() => onSwitchBike(bike.id)} aria-label={`${g.makeActive}: ${bikeTitle(t.profile.garage, bike)}`} className="h-9 px-4 rounded-full border border-line text-xs font-semibold text-ink hover:bg-sunken">{g.makeActive}</button>}
          </li>
        ))}
      </ul>
      {authenticated ? <button type="button" onClick={onManage} className={PILL_OUTLINE}>{g.manage}</button> : <p className="text-xs text-ink-3">{g.signInHint}</p>}
    </SurfaceCard>
  );
};

interface MiniTestsCardProps {
  t: Translations;
  hamstring: HamstringLevel | null;
  release: ReleaseResult | null;
  onTake: () => void;
}

/** What the two mobility tests found, or that they were not done, and the way to take them. */
export const MiniTestsCard: React.FC<MiniTestsCardProps> = ({ t, hamstring, release, onTake }) => {
  const m = t.shell.dashboard.miniTests;
  const rows: Array<[string, string]> = [[m.hamstring, hamstring ? m.answers[hamstring] : m.notDone], [m.release, release ? m.answers[release] : m.notDone]];
  return (
    <SurfaceCard as="section" testId="dashboard-minitests" className="space-y-3">
      <div>
        <h2 className="text-base font-bold text-ink">{m.title}</h2>
        <p className="text-xs text-ink-2 mt-1">{m.text}</p>
      </div>
      <dl className="space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3 text-sm">
            <dt className="text-ink-3">{label}</dt>
            <dd className="font-semibold text-ink text-right">{value}</dd>
          </div>
        ))}
      </dl>
      <button type="button" onClick={onTake} className={PILL_OUTLINE}>{m.take}</button>
    </SurfaceCard>
  );
};

/** The two modules that do not exist yet: a description and the badge, nothing to click. */
export const ModuleTiles: React.FC<{ t: Translations }> = ({ t }) => {
  const mod = t.shell.dashboard.modules;
  return (
    <div className="grid gap-4 content-start" data-testid="module-tiles">
      {([mod.care, mod.shop] as const).map((item) => (
        <section key={item.title} className="p-5 rounded-2xl border border-line bg-sunken">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-ink">{item.title}</h2>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border border-tone-warning-line bg-tone-warning-bg text-tone-warning-ink">{mod.comingSoon}</span>
          </div>
          <p className="text-xs text-ink-2 mt-2 leading-relaxed">{item.text}</p>
        </section>
      ))}
    </div>
  );
};
