import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import type { FactoryComponentTrap } from '@/types/baikfit';
import { SaddleRailSchematic } from '../schematics/SaddleRailSchematic';
import { SpacerSchematic } from '../schematics/SpacerSchematic';
import type { StockAuditView } from './buildStockAudit';

type Texts = Translations['stockBike']['audit'];

const Note: React.FC<{ text: string; tone?: 'warning' }> = ({ text, tone }) => (
  <p className={tone === 'warning' ? 'text-sm text-tone-warning-ink bg-tone-warning-bg border border-tone-warning-line rounded-xl px-3 py-2' : 'text-xs text-ink-3 leading-relaxed'}>{text}</p>
);

const Instruction: React.FC<{ title: string; text: string; warning: string | null; children: React.ReactNode }> = ({ title, text, warning, children }) => (
  <div className="p-4 rounded-2xl border border-line bg-surface space-y-3">
    <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-3">{title}</h4>
    <p className="text-sm text-ink leading-relaxed font-semibold">{text}</p>
    {warning && <Note text={warning} tone="warning" />}
    {children}
  </div>
);

const Trap: React.FC<{ trap: FactoryComponentTrap }> = ({ trap }) => (
  <li className="p-4 rounded-2xl border border-tone-danger-line bg-tone-danger-bg space-y-1.5" data-testid="stock-trap">
    <h4 className="text-sm font-bold text-tone-danger-ink">{trap.component}</h4>
    <p className="text-xs font-mono text-ink-2">{trap.stockSpec} &rarr; {trap.recommendedSpec}</p>
    <p className="text-sm text-ink-2 leading-relaxed">{trap.riskExplanation}</p>
    <p className="text-xs text-ink-3 leading-relaxed">{trap.savingsNote}</p>
  </li>
);

const Header: React.FC<{ a: Texts; view: StockAuditView }> = ({ a, view }) => (
  <div className="p-4 rounded-2xl border border-line bg-surface space-y-2">
    <div className="flex flex-wrap items-center gap-2">
      <h3 className="text-base font-bold text-ink">{view.bikeLine}</h3>
      <span data-testid="stock-origin" className={view.origin === 'ai' ? 'text-[11px] font-semibold px-2 py-0.5 rounded-full border border-tone-warning-line bg-tone-warning-bg text-tone-warning-ink' : 'text-[11px] font-semibold px-2 py-0.5 rounded-full border border-line bg-sunken text-ink-3'}>
        {view.origin === 'ai' ? a.badgeAi : a.badgeSeed}
      </span>
    </div>
    <p className="text-sm text-ink-2">{view.fitScore} &middot; {view.sizeText}</p>
    {view.sourceLine && <Note text={view.sourceLine} />}
  </div>
);

/** "Stock bike audit": what to change on the bike without buying anything, and the factory parts that do not suit the rider. */
export const StockBikeAudit: React.FC<{ t: Translations; view: StockAuditView }> = ({ t, view }) => {
  const a = t.stockBike.audit;
  return (
    <section id="stock-audit" aria-labelledby="stock-audit-title" className="space-y-4" data-testid="stock-audit">
      <div>
        <h2 id="stock-audit-title" className="text-lg font-bold text-ink tracking-tight">{a.title}</h2>
        <p className="text-sm text-ink-2 leading-relaxed mt-1 max-w-3xl">{a.intro}</p>
      </div>
      <Header a={a} view={view} />
      <h3 className="text-sm font-bold text-ink">{a.diyTitle}</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <Instruction title={t.studio.saddleX} text={view.saddle.text} warning={view.saddle.warning}>
          <SaddleRailSchematic t={a.schematics} deltaMm={view.saddle.deltaMm} outOfRange={view.saddle.warning !== null} />
        </Instruction>
        <Instruction title={a.spacersLabel} text={view.spacers.text} warning={view.spacers.warning}>
          <SpacerSchematic t={a.schematics} nowMm={view.spacers.nowMm} goalMm={view.spacers.goalMm} />
        </Instruction>
      </div>
      <p className="text-sm text-ink-2 leading-relaxed">{view.reachText}</p>
      {view.assumptions.map((note) => <Note key={note} text={note} />)}
      <h3 className="text-sm font-bold text-ink">{a.trapsTitle}</h3>
      {view.traps.length === 0 ? <Note text={a.trapsNone} /> : <ul className="grid gap-4 md:grid-cols-2">{view.traps.map((trap) => <Trap key={trap.component} trap={trap} />)}</ul>}
      {view.unknownNote && <Note text={view.unknownNote} />}
    </section>
  );
};
