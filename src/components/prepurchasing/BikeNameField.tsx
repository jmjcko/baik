'use client';

import React, { useId, useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { cx } from '@/lib/classNames';
import type { StockBikeSpec } from '@/lib/bikes/types';
import { nameOfBike, searchBikes } from './auditGeometry';

const INPUT_CLASS = 'w-full h-14 px-4 rounded-xl border border-line bg-surface text-ink text-base placeholder:text-ink-3 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-colors';

interface BikeNameFieldProps {
  t: Translations;
  id: string;
  value: string;
  onChange: (value: string) => void;
  /** The bikes of the catalog (seed and community) that the box suggests from. */
  bikes: readonly StockBikeSpec[];
}

/** The suggestion list: which bikes match, which one is highlighted, and the keys that move through it (arrows, Enter, Escape). */
function useSuggestions(value: string, bikes: readonly StockBikeSpec[], onChange: (value: string) => void) {
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(-1);
  const hits = searchBikes(value, bikes);
  const exact = hits.length === 1 && nameOfBike(hits[0]).toLowerCase() === value.trim().toLowerCase();
  const open = focused && hits.length > 0 && !exact;
  const choose = (bike: StockBikeSpec) => { onChange(nameOfBike(bike)); setActive(-1); setFocused(false); };
  const move = (step: number) => setActive((active + step + hits.length) % hits.length);
  const onKey = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); move(e.key === 'ArrowDown' ? 1 : -1); }
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); choose(hits[active]); }
    else if (e.key === 'Escape') setFocused(false);
  };
  return { hits, open, active, setActive, setFocused, choose, onKey };
}

/**
 * The name of the bike to audit: an empty box with a full text suggestion list of the catalog. Nothing is filled in for the rider;
 * choosing a suggestion writes the name of that bike, typing any other name is still allowed (its geometry is then asked for).
 */
export const BikeNameField: React.FC<BikeNameFieldProps> = ({ t, id, value, onChange, bikes }) => {
  const a = t.prePurchaseAudit;
  const listId = useId();
  const { hits, open, active, setActive, setFocused, choose, onKey } = useSuggestions(value, bikes, onChange);
  return (
    <div className="relative">
      <label htmlFor={id} className="text-sm font-semibold text-ink block mb-1.5">{a.bikeModelLabel}</label>
      <input
        id={id} type="text" role="combobox" aria-expanded={open} aria-controls={listId} aria-autocomplete="list" aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off" value={value} placeholder={a.bikeModelPlaceholder} className={INPUT_CLASS}
        onChange={(e) => { onChange(e.target.value); setActive(-1); }} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onKeyDown={onKey}
      />
      {open && (
        <ul id={listId} role="listbox" aria-label={t.geometry.suggestionsLabel} data-testid="bike-suggestions" className="absolute z-20 left-0 right-0 mt-1 max-h-64 overflow-y-auto rounded-xl border border-line bg-surface shadow-lg py-1">
          {hits.map((bike, index) => (
            <li key={bike.id} id={`${listId}-${index}`} role="option" aria-selected={index === active} onMouseDown={(e) => { e.preventDefault(); choose(bike); }} className={cx('px-4 py-2 text-sm cursor-pointer', index === active ? 'bg-sunken text-ink' : 'text-ink-2 hover:bg-sunken')}>
              {nameOfBike(bike)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
