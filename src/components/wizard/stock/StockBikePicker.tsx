'use client';

import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { resolveStockBike } from '@/lib/bikes/resolve';
import type { AiStockSelection, SizeSpec, StockSelection } from '@/lib/bikes/types';
import { BRANDS, bikeOf, modelsOf, useStockBikePicker } from './useStockBikePicker';
import { StockBikeUrlForm } from './StockBikeUrlForm';

const SELECT = 'w-full h-12 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500 disabled:opacity-50';

const Pick: React.FC<{ label: string; value: string; choose: string; options: Array<[string, string]>; disabled?: boolean; onChange: (value: string) => void }> = ({ label, value, choose, options, disabled, onChange }) => (
  <label className="block space-y-1">
    <span className="text-xs font-semibold text-slate-700">{label}</span>
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
}

const Summary: React.FC<{ t: Translations; stockBike: StockSelection }> = ({ t, stockBike }) => {
  const p = t.stockBike.picker;
  const resolved = resolveStockBike(stockBike, 'road');
  if (!resolved) return null;
  const { bike, size, spec, origin } = resolved;
  const text = origin === 'ai' ? fill(p.aiSelected, { brand: bike.brand, model: bike.model, year: bike.years[0], size }) : fill(p.summary, { brand: bike.brand, model: bike.model, year: bike.years[0], size, stack: spec.frameStackMm, reach: spec.frameReachMm });
  return (
    <div className="text-xs text-slate-700 leading-relaxed space-y-1" data-testid="stock-summary">
      <p className="font-semibold">{text}</p>
      {origin === 'seed' && <p>{fill(p.sourceLine, { source: bike.source.name, date: bike.source.verifiedOn })}</p>}
    </div>
  );
};

const Toggle: React.FC<{ texts: Translations['stockBike']['picker']; on: boolean; onToggle: () => void }> = ({ texts, on, onToggle }) => (
  <button type="button" role="switch" aria-checked={on} onClick={onToggle} className="w-full flex items-center justify-between gap-4 text-left">
    <span>
      <span className="block text-sm font-bold text-slate-900">{texts.toggleLabel}</span>
      <span className="block text-xs text-slate-600 leading-relaxed">{texts.toggleHint}</span>
    </span>
    <span aria-hidden="true" className={`shrink-0 w-12 h-7 rounded-full p-1 transition-colors ${on ? 'bg-blue-600' : 'bg-slate-300'}`}>
      <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${on ? 'translate-x-5' : ''}`} />
    </span>
  </button>
);

type Picker = ReturnType<typeof useStockBikePicker>;

/** The four selects: each one opens the next (Brand, Model, Year, Frame size). */
const Cascade: React.FC<{ texts: Translations['stockBike']['picker']; picker: Picker }> = ({ texts: p, picker }) => {
  const { choice, pick } = picker;
  const bike = bikeOf(choice);
  return (
    <div className="grid grid-cols-2 gap-3">
      <Pick label={p.brandLabel} value={choice.brand} choose={p.choose} options={BRANDS.map((brand) => [brand, brand])} onChange={(v) => pick('brand', v)} />
      <Pick label={p.modelLabel} value={choice.model} choose={p.choose} disabled={!choice.brand} options={modelsOf(choice.brand).map((m) => [m.model, m.model])} onChange={(v) => pick('model', v)} />
      <Pick label={p.yearLabel} value={choice.year} choose={p.choose} disabled={!bike} options={(bike?.years ?? []).map((y) => [String(y), String(y)])} onChange={(v) => pick('year', v)} />
      <Pick label={p.sizeLabel} value={choice.size} choose={p.choose} disabled={!bike} options={(bike?.sizeOrder ?? []).map((s) => [s, s])} onChange={(v) => pick('size', v)} />
    </div>
  );
};

/** Wizard step 4: "My bike has its original factory setup", then Brand, Model, Year and Frame size (or a link when the bike is not in the list). */
export const StockBikePicker: React.FC<StockBikePickerProps> = ({ t, stockBike, setStockBike, setCurrentBarWidthMm, setCrankLengthMm }) => {
  const p = t.stockBike.picker;
  const onPrefill = (spec: SizeSpec) => {
    if (spec.stockHandlebarMm !== null) setCurrentBarWidthMm(spec.stockHandlebarMm);
    if (spec.stockCrankMm !== null) setCrankLengthMm(spec.stockCrankMm);
  };
  const picker = useStockBikePicker({ stockBike, onSelect: setStockBike, onPrefill });
  const confirmAi = (ai: AiStockSelection) => {
    setStockBike(ai);
    onPrefill(ai.spec);
    picker.closeUrl();
  };
  return (
    <div className="p-5 rounded-xl border border-slate-200/80 bg-slate-50/60 space-y-4" data-testid="stock-picker">
      <Toggle texts={p} on={picker.enabled} onToggle={picker.toggle} />
      {picker.enabled && !picker.fromUrl && (
        <div className="space-y-3">
          <Cascade texts={p} picker={picker} />
          {stockBike && <Summary t={t} stockBike={stockBike} />}
          <button type="button" onClick={picker.openUrl} className="text-xs font-semibold text-blue-700 hover:underline">{p.notListed}</button>
        </div>
      )}
      {picker.enabled && picker.fromUrl && <StockBikeUrlForm t={t} onConfirm={confirmAi} onBack={picker.closeUrl} />}
    </div>
  );
};
