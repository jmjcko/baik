import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { isDay } from '@/lib/notifications/dates';
import type { RideTerrain } from '@/lib/engines/baikcare/wearIntervals';
import { BOOK_LIMITS, type LoggedRide } from '@/types/service';
import { FIELD_SM } from '@/components/primitives/fieldStyles';

const INPUT = FIELD_SM;
const TERRAINS: RideTerrain[] = ['road', 'gravel', 'mtb', 'trainer'];

/** A number typed by the rider (a decimal comma is accepted); NaN when it is not one. */
const numberOf = (text: string): number => (text.trim() === '' ? Number.NaN : Number(text.trim().replace(',', '.')));

interface FormProps {
  t: Translations;
  today: string;
  onAdd: (ride: LoggedRide) => void;
}

type Problem = 'date' | 'km' | 'climb' | null;

/** The fields of one ride; what is wrong with them is said before anything is added. */
function useRideForm(today: string, onAdd: (ride: LoggedRide) => void) {
  const [fields, setFields] = useState({ date: today, terrain: 'road' as RideTerrain, km: '', climb: '0', rain: false });
  const [problem, setProblem] = useState<Problem>(null);
  const set = (patch: Partial<typeof fields>) => setFields((previous) => ({ ...previous, ...patch }));
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const km = numberOf(fields.km);
    const climb = numberOf(fields.climb);
    const found: Problem = !isDay(fields.date) ? 'date' : !(km >= BOOK_LIMITS.rideKm.min && km <= BOOK_LIMITS.rideKm.max) ? 'km' : !(climb >= 0 && climb <= BOOK_LIMITS.rideClimbM) ? 'climb' : null;
    setProblem(found);
    if (found) return;
    onAdd({ id: `r${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, date: fields.date, terrain: fields.terrain, km, elevationM: climb, rain: fields.rain });
    setFields({ ...fields, km: '', climb: '0', rain: false });
  };
  return { fields, set, problem, submit };
}

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block space-y-1">
    <span className="text-xs font-semibold text-ink-3">{label}</span>
    {children}
  </label>
);

/** The form for one ride: the day, the type, the distance, the climbing and a tick for the rain. */
export const RideLogForm: React.FC<FormProps> = ({ t, today, onAdd }) => {
  const r = t.service.logbook.rides;
  const { fields, set, problem, submit } = useRideForm(today, onAdd);
  return (
    <form onSubmit={submit} data-testid="ride-form" className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label={r.date}><input type="date" className={INPUT} value={fields.date} onChange={(e) => set({ date: e.target.value })} /></Field>
        <Field label={r.terrain}>
          <select className={INPUT} value={fields.terrain} onChange={(e) => set({ terrain: e.target.value as RideTerrain })}>
            {TERRAINS.map((terrain) => <option key={terrain} value={terrain}>{r.terrains[terrain]}</option>)}
          </select>
        </Field>
        <Field label={r.km}><input inputMode="decimal" className={INPUT} value={fields.km} onChange={(e) => set({ km: e.target.value })} /></Field>
        <Field label={r.climb}><input inputMode="numeric" className={INPUT} value={fields.climb} onChange={(e) => set({ climb: e.target.value })} /></Field>
      </div>
      <label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" checked={fields.rain} onChange={(e) => set({ rain: e.target.checked })} />{r.rain}</label>
      {problem && <p role="alert" className="text-sm text-tone-danger-ink">{r.errors[problem]}</p>}
      <button type="submit" className="h-10 px-5 rounded-full text-sm font-semibold bg-blue-600 text-slate-50 hover:bg-blue-700 transition-colors">{r.add}</button>
    </form>
  );
};

/** The recent rides, newest first, each with a button to remove it. */
export const RideList: React.FC<{ t: Translations; rides: LoggedRide[]; onRemove: (id: string) => void; onRain: (id: string, rain: boolean) => void }> = ({ t, rides, onRemove, onRain }) => {
  const r = t.service.logbook.rides;
  if (rides.length === 0) return <p className="text-sm text-ink-2" data-testid="ride-empty">{r.empty}</p>;
  return (
    <ul className="divide-y divide-line rounded-xl border border-line bg-surface" data-testid="ride-list">
      {rides.slice(0, 20).map((ride) => (
        <li key={ride.id} data-testid="ride-row" className="flex items-center justify-between gap-3 px-4 py-2 text-sm text-ink">
          <span>{fill(r.row, { date: ride.date, terrain: r.terrains[ride.terrain], km: ride.km, m: ride.elevationM })}{ride.rain ? ` · ${r.wet}` : ''}</span>
          <label className="ml-auto inline-flex items-center gap-1 text-xs text-ink-2"><input type="checkbox" checked={ride.rain} aria-label={fill(t.service.logbook.strava.rideRain, { date: ride.date })} onChange={(e) => onRain(ride.id, e.target.checked)} />{r.wet}</label>
          <button type="button" aria-label={fill(r.remove, { date: ride.date })} onClick={() => onRemove(ride.id)} className="h-8 w-8 inline-flex items-center justify-center rounded-full text-ink-2 hover:bg-sunken"><X aria-hidden="true" className="w-4 h-4" /></button>
        </li>
      ))}
    </ul>
  );
};
