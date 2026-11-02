'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { Bike, Check, ChevronDown } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { cx } from '@/lib/classNames';
import { fill } from '@/lib/i18n/format';

export interface PickerBike {
  id: string;
  name: string;
}

interface PickerProps {
  t: Translations;
  bikes: PickerBike[];
  activeId: string;
  /** The name of the active bike when the garage has none to choose from. */
  fallbackName: string;
  onSwitch?: (bikeId: string) => void;
}

const CHIP = 'inline-flex h-11 items-center gap-2 rounded-full border border-tone-info-line bg-tone-info-bg text-sm font-bold text-tone-info-ink';

/** Calls a handler when the mouse goes down outside of an element, while the element is open. */
function useOutsideClick(ref: React.RefObject<HTMLElement | null>, active: boolean, onOutside: () => void): void {
  useEffect(() => {
    if (!active) return;
    const onDown = (event: MouseEvent) => { if (ref.current && !ref.current.contains(event.target as Node)) onOutside(); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [ref, active, onOutside]);
}

interface MenuProps {
  id: string;
  label: string;
  bikes: PickerBike[];
  activeId: string;
  onPick: (bikeId: string) => void;
  onClose: () => void;
}

/** The list of bikes: arrows, Home and End move, Enter or Space chooses, Escape and Tab close. */
const BikeMenu: React.FC<MenuProps> = ({ id, label, bikes, activeId, onPick, onClose }) => {
  const [focus, setFocus] = useState(Math.max(bikes.findIndex((bike) => bike.id === activeId), 0));
  const items = useRef<(HTMLLIElement | null)[]>([]);
  useEffect(() => items.current[focus]?.focus(), [focus]);
  const onKeyDown = (event: React.KeyboardEvent) => {
    const move: Record<string, number> = { ArrowDown: (focus + 1) % bikes.length, ArrowUp: (focus + bikes.length - 1) % bikes.length, Home: 0, End: bikes.length - 1 };
    if (event.key in move) { event.preventDefault(); setFocus(move[event.key]); }
    else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onPick(bikes[focus].id); }
    else if (event.key === 'Escape' || event.key === 'Tab') { event.preventDefault(); onClose(); }
  };
  return (
    <ul id={id} role="listbox" aria-label={label} onKeyDown={onKeyDown} data-testid="care-bike-menu" className="absolute right-0 top-full z-30 mt-2 min-w-full max-w-xs overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-lg">
      {bikes.map((bike, index) => (
        <li key={bike.id} ref={(node) => { items.current[index] = node; }} role="option" aria-selected={bike.id === activeId} tabIndex={-1} onClick={() => onPick(bike.id)} data-testid={`care-bike-option-${bike.id}`} className={cx('flex cursor-pointer items-center justify-between gap-3 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm outline-none hover:bg-sunken focus:bg-sunken', bike.id === activeId ? 'bg-tone-info-bg font-bold text-tone-info-ink' : 'font-semibold text-ink')}>
          {bike.name}
          {bike.id === activeId && <Check aria-hidden="true" className="h-4 w-4 shrink-0" />}
        </li>
      ))}
    </ul>
  );
};

/** The bike that bAIkcare works with: a list of all the rider's bikes, or just its name when there is no other to choose. */
export const BikePicker: React.FC<PickerProps> = ({ t, bikes, activeId, fallbackName, onSwitch }) => {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const close = () => setOpen(false);
  useOutsideClick(root, open, close);
  if (!onSwitch || bikes.length < 2) {
    return <p className={`${CHIP} px-4`} data-testid="care-bike"><Bike aria-hidden="true" className="w-4 h-4" />{fill(t.care.bikeLabel, { bike: fallbackName })}</p>;
  }
  const label = t.shell.header.bikeSwitcherLabel;
  const pick = (bikeId: string) => { setOpen(false); trigger.current?.focus(); if (bikeId !== activeId) onSwitch(bikeId); };
  return (
    <div ref={root} className="relative" data-testid="care-bike">
      <button ref={trigger} type="button" aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? menuId : undefined} onClick={() => setOpen(!open)} onKeyDown={(e) => { if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); } }} data-testid="care-bike-trigger" className={`${CHIP} pl-4 pr-3.5 hover:bg-sunken focus-visible:ring-2 focus-visible:ring-blue-600 focus:outline-none`}>
        <Bike aria-hidden="true" className="h-4 w-4 shrink-0" />
        <span className="sr-only">{label}: </span>
        <span className="max-w-[16rem] truncate">{bikes.find((bike) => bike.id === activeId)?.name ?? fallbackName}</span>
        <ChevronDown aria-hidden="true" className={cx('h-4 w-4 shrink-0 transition-transform', open && 'rotate-180')} />
      </button>
      {open && <BikeMenu id={menuId} label={label} bikes={bikes} activeId={activeId} onPick={pick} onClose={() => { close(); trigger.current?.focus(); }} />}
    </div>
  );
};
