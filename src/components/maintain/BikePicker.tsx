import React from 'react';
import { Bike, ChevronDown } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
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

/** The bike that bAIkcare works with: a drop-down of all the rider's bikes, or just its name when there is no other to choose. */
export const BikePicker: React.FC<PickerProps> = ({ t, bikes, activeId, fallbackName, onSwitch }) => {
  if (!onSwitch || bikes.length < 2) {
    return <p className={`${CHIP} px-4`} data-testid="care-bike"><Bike aria-hidden="true" className="w-4 h-4" />{fill(t.care.bikeLabel, { bike: fallbackName })}</p>;
  }
  return (
    <label className={`${CHIP} relative pl-4 pr-10 focus-within:ring-2 focus-within:ring-blue-600`} data-testid="care-bike">
      <Bike aria-hidden="true" className="w-4 h-4 shrink-0" />
      <span className="sr-only">{t.shell.header.bikeSwitcherLabel}</span>
      <select value={activeId} onChange={(e) => onSwitch(e.target.value)} data-testid="care-bike-select" className="appearance-none bg-transparent font-bold focus:outline-none cursor-pointer max-w-[16rem] truncate">
        {bikes.map((bike) => <option key={bike.id} value={bike.id}>{bike.name}</option>)}
      </select>
      <ChevronDown aria-hidden="true" className="w-4 h-4 absolute right-3.5 pointer-events-none" />
    </label>
  );
};
