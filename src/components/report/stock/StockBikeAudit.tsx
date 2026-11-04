import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import type { FactoryComponentTrap } from '@/types/baikfit';
import { SaddleRailSchematic } from '../schematics/SaddleRailSchematic';
import { SpacerSchematic } from '../schematics/SpacerSchematic';
import type { StockAuditView } from './buildStockAudit';

const Note: React.FC<{ text: string; tone?: 'warning' }> = ({ text, tone }) => (
  <p className={tone === 'warning' ? 'text-sm text-tone-warning-ink bg-tone-warning-bg border border-tone-warning-line rounded-xl px-3 py-2' : 'text-xs text-ink-3 leading-relaxed'}>{text}</p>
);

const Why: React.FC<{ label: string; reason: string }> = ({ label, reason }) => (
  <p className="text-xs text-ink-2 leading-relaxed" data-testid="reason"><span className="font-semibold text-teal-ink">{label}: </span>{reason}</p>
);

const Instruction: React.FC<{ title: string; text: string; reason: string; why: string; warning: string | null; children: React.ReactNode }> = ({ title, text, reason, why, warning, children }) => (
  <div className="p-4 rounded-2xl border border-line bg-surface space-y-3">
    <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-3">{title}</h4>
    <p className="text-sm text-ink leading-relaxed font-semibold">{text}</p>
    <Why label={why} reason={reason} />
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

const Header: React.FC<{ view: StockAuditView }> = ({ view }) => (
  <div className="p-4 rounded-2xl border border-line bg-surface space-y-2">
    <div className="flex flex-wrap items-center gap-2">
      <h3 className="text-base font-bold text-ink">{view.bikeLine}</h3>
      <span data-testid="stock-origin" className={view.origin === 'ai' ? 'text-[11px] font-semibold px-2 py-0.5 rounded-full border border-tone-warning-line bg-tone-warning-bg text-tone-warning-ink' : 'text-[11px] font-semibold px-2 py-0.5 rounded-full border border-line bg-sunken text-ink-3'}>
        {view.badge}
      </span>
    </div>
    <p className="text-sm text-ink-2">{view.fitScore} &middot; {view.sizeText}</p>
    {view.sourceLine && <Note text={view.sourceLine} />}
  </div>
);

/** What the rider leaves as it is: one line with its reason, no drawing (a drawing of two equal columns would show a change that is not one). */
const Keeps: React.FC<{ title: string; items: Array<{ label: string; text: string; reason: string }>; why: string }> = ({ title, items, why }) => (
  <div className="p-4 rounded-2xl border border-line bg-sunken space-y-3" data-testid="stock-keep">
    <h3 className="text-sm font-bold text-ink">{title}</h3>
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.label} className="space-y-0.5">
          <p className="text-sm text-ink"><span className="font-semibold">{item.label}: </span>{item.text}</p>
          <Why label={why} reason={item.reason} />
        </li>
      ))}
    </ul>
  </div>
);

/** The changes that are real: a card with its drawing for the saddle and the spacers, and a line for the stem. */
const Changes: React.FC<{ t: Translations; view: StockAuditView; why: string }> = ({ t, view, why }) => {
  const a = t.stockBike.audit;
  return (
    <>
      <h3 className="text-sm font-bold text-ink">{a.diyTitle}</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {view.changes.saddle && (
          <Instruction title={t.studio.saddleX} text={view.saddle.text} reason={view.saddle.reason} why={why} warning={view.saddle.warning}>
            <SaddleRailSchematic t={a.schematics} deltaMm={view.saddle.deltaMm} outOfRange={view.saddle.warning !== null} />
          </Instruction>
        )}
        {view.changes.spacers && (
          <Instruction title={a.spacersLabel} text={view.spacers.text} reason={view.spacers.reason} why={why} warning={view.spacers.warning}>
            <SpacerSchematic t={a.schematics} nowMm={view.spacers.nowMm} goalMm={view.spacers.goalMm} />
          </Instruction>
        )}
      </div>
      {view.changes.reach && <><p className="text-sm text-ink font-semibold leading-relaxed">{view.reachText}</p><Why label={why} reason={view.reachReason} /></>}
    </>
  );
};

/** The lines of what stays: the saddle, the spacers and the stem that need no change. */
function keepItems(t: Translations, view: StockAuditView): Array<{ label: string; text: string; reason: string }> {
  const a = t.stockBike.audit;
  return [
    ...(view.changes.saddle ? [] : [{ label: t.studio.saddleX, text: view.saddle.text, reason: view.saddle.reason }]),
    ...(view.changes.spacers ? [] : [{ label: a.spacersLabel, text: view.spacers.text, reason: view.spacers.reason }]),
    ...(view.changes.reach ? [] : [{ label: a.stemLabel, text: view.reachText, reason: view.reachReason }]),
  ];
}

/** "Stock bike audit": the factory parts that do not suit the rider, what to change on the bike without buying anything (only the real changes), and what to leave as it is. */
export const StockBikeAudit: React.FC<{ t: Translations; view: StockAuditView }> = ({ t, view }) => {
  const a = t.stockBike.audit;
  const why = t.diagnosticReport.reasons.label;
  const keeps = keepItems(t, view);
  const anyChange = view.changes.saddle || view.changes.spacers || view.changes.reach;
  return (
    <section id="stock-audit" aria-labelledby="stock-audit-title" className="space-y-4" data-testid="stock-audit">
      <div>
        <h2 id="stock-audit-title" className="text-lg font-bold text-ink tracking-tight">{a.title}</h2>
        <p className="text-sm text-ink-2 leading-relaxed mt-1 max-w-3xl">{a.intro}</p>
      </div>
      <Header view={view} />
      <h3 className="text-sm font-bold text-ink">{a.trapsTitle}</h3>
      {view.traps.length === 0 ? <Note text={a.trapsNone} /> : <ul className="grid gap-4 md:grid-cols-2">{view.traps.map((trap) => <Trap key={trap.component} trap={trap} />)}</ul>}
      {view.unknownNote && <Note text={view.unknownNote} />}
      {anyChange && <Changes t={t} view={view} why={why} />}
      {keeps.length > 0 && <Keeps title={a.keepTitle} items={keeps} why={why} />}
      {view.assumptions.length > 0 && (
        <details data-testid="stock-assumptions" className="text-xs text-ink-3">
          <summary className="cursor-pointer font-semibold text-ink-2">{a.assumptionsTitle} ({view.assumptions.length})</summary>
          <div className="mt-2 space-y-2">{view.assumptions.map((note) => <Note key={note} text={note} />)}</div>
        </details>
      )}
    </section>
  );
};
