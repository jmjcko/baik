'use client';

import React, { useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { resolveStockBike } from '@/lib/bikes/resolve';
import type { SizeSpec, StockBikeSpec, StockSelection } from '@/lib/bikes/types';
import { StockBikeReview } from './StockBikeReview';
import { StockBikeSourceForm } from './StockBikeSourceForm';
import { brandsOf, bikeOf, modelsOf } from './useStockBikePicker';
import { useStockBikeFlow, type ShareState } from './useStockBikeFlow';
import { SaveBikeDialog } from './SaveBikeDialog';
import { useBikeSwitchGate } from './useBikeSwitchGate';

const SELECT = 'w-full h-12 rounded-xl border border-line bg-surface px-3 text-sm text-ink focus:outline-none focus:border-blue-500 disabled:opacity-50';

const Pick: React.FC<{ label: string; value: string; choose: string; options: Array<[string, string]>; disabled?: boolean; onChange: (value: string) => void }> = ({ label, value, choose, options, disabled, onChange }) => (
  <label className="block space-y-1">
    <span className="text-xs font-semibold text-ink-2">{label}</span>
    <select value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} className={SELECT}>
      <option value="">{choose}</option>
      {options.map(([key, text]) => <option key={key} value={key}>{text}</option>)}
    </select>
  </label>
);

export interface StockBikePickerProps {
  t: Translations;
  stockBike: StockSelection | null;
  setStockBike: (selection: StockSelection | null) => void;
  setCurrentBarWidthMm: (value: number | null) => void;
  setCrankLengthMm: (value: number) => void;
  /** The name of the active garage bike and the way to add another one: with both, a chosen bike that would replace the one of the garage bike is offered as a new bike first. */
  activeBikeName?: string | null;
  onAddBike?: (name: string) => boolean;
}

const Summary: React.FC<{ t: Translations; stockBike: StockSelection }> = ({ t, stockBike }) => {
  const p = t.stockBike.picker;
  const resolved = resolveStockBike(stockBike, 'road');
  if (!resolved) return null;
  const { bike, size, spec, origin } = resolved;
  const text = fill(p.summary, { brand: bike.brand, model: bike.model, year: bike.years[0], size, stack: spec.frameStackMm, reach: spec.frameReachMm });
  return (
    <div className="text-xs text-ink-2 leading-relaxed space-y-1" data-testid="stock-summary">
      <p className="font-semibold">{text}</p>
      {origin === 'seed' && <p>{fill(p.sourceLine, { source: bike.source.name, date: bike.source.verifiedOn })}</p>}
    </div>
  );
};

const Toggle: React.FC<{ texts: Translations['stockBike']['picker']; on: boolean; onToggle: () => void }> = ({ texts, on, onToggle }) => (
  <button type="button" role="switch" aria-checked={on} onClick={onToggle} className="w-full flex items-center justify-between gap-4 text-left">
    <span>
      <span className="block text-sm font-bold text-ink">{texts.toggleLabel}</span>
      <span className="block text-xs text-ink-2 leading-relaxed">{texts.toggleHint}</span>
    </span>
    <span aria-hidden="true" className={`shrink-0 w-12 h-7 rounded-full p-1 transition-colors ${on ? 'bg-blue-600' : 'bg-slate-300'}`}>
      <span className={`block w-5 h-5 rounded-full bg-surface transition-transform ${on ? 'translate-x-5' : ''}`} />
    </span>
  </button>
);

type Flow = ReturnType<typeof useStockBikeFlow>;
type Chosen = Extract<StockSelection, { source: 'ai' | 'community' }>;

/** The bike that the AI read or that came from the catalog and that the rider confirmed: shown as the chosen bike (not as an empty list), with the way to read another one or to use the list. */
const ChosenBikeCard: React.FC<{ t: Translations; bike: Chosen; share: ShareState; onAnother: () => void; onList: () => void }> = ({ t, bike, share, onAnother, onList }) => {
  const p = t.stockBike.picker;
  const mm = (value: number | null) => (value === null ? p.aiCardNone : `${value} mm`);
  const { spec } = bike;
  return (
    <div role="group" aria-label={bike.source === 'ai' ? p.aiCardTitle : p.communityCardTitle} className="rounded-xl border border-tone-info-line bg-surface p-4 space-y-2" data-testid="stock-ai-card">
      <p className="text-[11px] font-mono uppercase tracking-wider text-tone-info-ink">{bike.source === 'ai' ? p.aiCardTitle : p.communityCardTitle}</p>
      <p className="text-sm font-bold text-ink">{fill(t.stockBike.audit.bikeLine, { brand: bike.brand, model: bike.model, year: bike.year, size: bike.size })}</p>
      <p className="text-xs text-ink-2">{fill(p.aiCardNumbers, { stack: spec.frameStackMm, reach: spec.frameReachMm, angle: spec.seatTubeAngleDeg })}</p>
      <p className="text-xs text-ink-2">{fill(p.aiCardParts, { stem: mm(spec.stockStemMm), handlebar: mm(spec.stockHandlebarMm), crank: mm(spec.stockCrankMm) })}</p>
      {share !== 'idle' && <p role="status" className="text-xs text-ink-2">{share === 'sent' ? p.shareSent : p.shareFailed}</p>}
      <div className="flex flex-wrap gap-2 pt-1">
        <button type="button" onClick={onAnother} className="h-10 px-5 rounded-full border border-blue-600 bg-blue-600 text-slate-50 text-sm font-semibold hover:bg-blue-700">{p.readAnother}</button>
        <button type="button" onClick={onList} className="h-10 px-5 rounded-full border border-line bg-surface text-ink-2 text-sm font-semibold hover:bg-sunken">{p.useList}</button>
      </div>
    </div>
  );
};

/** The four selects: each one opens the next (Brand, Model, Year, Frame size). Catalog bikes are marked in the model list. */
const Cascade: React.FC<{ texts: Translations['stockBike']['picker']; picker: Flow['picker']; bikes: StockBikeSpec[]; communityLabel: string }> = ({ texts: p, picker, bikes, communityLabel }) => {
  const { choice, pick } = picker;
  const bike = bikeOf(bikes, choice);
  const modelLabel = (m: StockBikeSpec) => (m.id.startsWith('community-') ? `${m.model} (${communityLabel})` : m.model);
  return (
    <div className="grid grid-cols-2 gap-3">
      <Pick label={p.brandLabel} value={choice.brand} choose={p.choose} options={brandsOf(bikes).map((brand) => [brand, brand])} onChange={(v) => pick('brand', v)} />
      <Pick label={p.modelLabel} value={choice.model} choose={p.choose} disabled={!choice.brand} options={modelsOf(bikes, choice.brand).map((m) => [m.model, modelLabel(m)])} onChange={(v) => pick('model', v)} />
      <Pick label={p.yearLabel} value={choice.year} choose={p.choose} disabled={!bike} options={(bike?.years ?? []).map((y) => [String(y), String(y)])} onChange={(v) => pick('year', v)} />
      <Pick label={p.sizeLabel} value={choice.size} choose={p.choose} disabled={!bike} options={(bike?.sizeOrder ?? []).map((s) => [s, s])} onChange={(v) => pick('size', v)} />
    </div>
  );
};

/** The stock handlebar and crank of the chosen size become the current ones. */
const prefillWith = (setBar: (value: number | null) => void, setCrank: (value: number) => void) => (spec: SizeSpec) => {
  if (spec.stockHandlebarMm !== null) setBar(spec.stockHandlebarMm);
  if (spec.stockCrankMm !== null) setCrank(spec.stockCrankMm);
};

/** Wizard step 4: "My bike has its original factory setup", then Brand, Model, Year and Frame size (or a link or a picture when the bike is not in the list). */
const StockBikePickerBody: React.FC<StockBikePickerProps & { onReset: () => void }> = ({ t, stockBike, setStockBike, setCurrentBarWidthMm, setCrankLengthMm, activeBikeName, onAddBike, onReset }) => {
  const p = t.stockBike.picker;
  const onPrefill = prefillWith(setCurrentBarWidthMm, setCrankLengthMm);
  const gate = useBikeSwitchGate({ stockBike, setStockBike, onPrefill, onAddBike });
  const flow = useStockBikeFlow({ stockBike, setStockBike: gate.select, onPartial: gate.partial, onPrefill: gate.prefill });
  const { picker } = flow;
  const chosen = stockBike && stockBike.source !== 'seed' ? stockBike : null;
  const pending = picker.pending?.selection;
  return (
    <div className="p-5 rounded-xl border border-line bg-sunken space-y-4" data-testid="stock-picker">
      <Toggle texts={p} on={picker.enabled} onToggle={picker.toggle} />
      {picker.enabled && picker.fromUrl && <StockBikeSourceForm t={t} canShare={flow.canShare} onConfirm={flow.confirmAi} onBack={picker.closeUrl} />}
      {picker.enabled && !picker.fromUrl && chosen && <ChosenBikeCard t={t} bike={chosen} share={flow.share} onAnother={picker.openUrl} onList={() => setStockBike(null)} />}
      {picker.enabled && !picker.fromUrl && !chosen && (
        <div className="space-y-3">
          <Cascade texts={p} picker={picker} bikes={flow.bikes} communityLabel={p.communityLabel} />
          {pending && <StockBikeReview t={t} bike={pending} community={{ confirmations: pending.confirmations }} onConfirm={flow.confirmCommunity} onDiscard={picker.clearPending} />}
          {stockBike && <Summary t={t} stockBike={stockBike} />}
          <button type="button" onClick={picker.openUrl} className="text-xs font-semibold text-tone-info-ink hover:underline">{p.notListed}</button>
        </div>
      )}
      {gate.held && stockBike && <SaveBikeDialog t={t} chosen={gate.held.selection} current={stockBike} activeBikeName={activeBikeName ?? null} failed={gate.failed} onSaveAsNew={gate.saveAsNew} onReplace={gate.replace} onCancel={() => { gate.cancel(); onReset(); }} />}
    </div>
  );
};

/** The picker restarts from the stored bike when the rider cancels a held choice (its lists and fields then show the bike that is still in use). */
export const StockBikePicker: React.FC<StockBikePickerProps> = (props) => {
  const [round, setRound] = useState(0);
  return <StockBikePickerBody key={round} {...props} onReset={() => setRound((n) => n + 1)} />;
};
