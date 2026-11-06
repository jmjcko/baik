import type { Translations } from '../types';

export const connections: Translations['connections'] = {
  title: 'Connections',
  intro: 'Services that bring the rides of this bike into the wear logbook. They only read the day, the kind, the distance and the climbing of a ride.',
  summary: '{n} of {total} services bring rides to this bike.',
  summaryNone: 'No service brings rides to this bike yet.',
  states: { checking: 'Checking', guest: 'Sign in needed', unavailable: 'Not set up', disconnected: 'Not connected', connected: 'Connected, no bike paired', paired: 'Connected and paired', keySaved: 'Key saved, no rule yet' },
  pointer: 'Rides from Strava or Intervals.icu are set up in the Connections tab.',
  pointerButton: 'Open Connections',
};
