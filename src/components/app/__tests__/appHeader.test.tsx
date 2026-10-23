import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { fakeAuthClient, riderSession } from '@/test/fakeAuthClient';
import type { BikeProfile } from '@/lib/passport/types';
import type { AppMode } from '@/components/navigation/appMode';
import type { SyncState } from '@/lib/hooks/useRiderPassport';
import { AppHeader } from '../AppHeader';

const bike = (over: Partial<BikeProfile>): BikeProfile => ({ id: 'x', name: null, factoryName: null, year: null, size: null, isStock: false, diagnosis: null, isActive: false, ...over });
const garage = { bikes: [bike({ id: 'a', name: 'Road bike', isActive: true }), bike({ id: 'b', factoryName: 'Canyon Endurace' }), bike({ id: 'c' })], activeBikeId: 'a' };
const MODES: AppMode[] = ['entry', 'wizard', 'report', 'studio', 'prepurchasing', 'profile', 'admin', 'capabilities'];

async function setup(locale: Locale, { mode = 'entry' as AppMode, sync = 'idle' as SyncState, signedIn = false, withGarage = true } = {}) {
  const fake = fakeAuthClient();
  const onSwitchBike = vi.fn();
  render(<AuthProvider client={fake.client}><AppHeader t={translations[locale]} mode={mode} garage={withGarage ? garage : null} onSwitchBike={onSwitchBike} sync={sync} /></AuthProvider>);
  await act(async () => fake.emit('INITIAL_SESSION', null));
  if (signedIn) await act(async () => fake.emit('SIGNED_IN', riderSession));
  return { onSwitchBike };
}

describe.each(['en', 'cs'] as Locale[])('the application header (%s)', (locale) => {
  const h = translations[locale].shell.header;

  it.each(MODES)('should say where the rider is in the mode %s, in the language of the app', async (mode) => {
    await setup(locale, { mode });
    expect(screen.getByRole('banner')).toHaveTextContent(h.modes[mode]);
  });

  it('should list the bikes of the garage with the active one selected, and say so for a bike without a name', async () => {
    await setup(locale);
    const select = screen.getByRole('combobox', { name: h.bikeSwitcherLabel });
    expect(select).toHaveValue('a');
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['Road bike', 'Canyon Endurace', translations[locale].profile.garage.unnamed]);
  });

  it('should hand over the bike the rider chooses', async () => {
    const { onSwitchBike } = await setup(locale);
    fireEvent.change(screen.getByRole('combobox', { name: h.bikeSwitcherLabel }), { target: { value: 'b' } });
    expect(onSwitchBike).toHaveBeenCalledWith('b');
  });

  it('should show no switcher while there is no garage', async () => {
    await setup(locale, { withGarage: false });
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('should show the state of the account: guest, synced, syncing and error', async () => {
    await setup(locale);
    expect(screen.getByTestId('header-status')).toHaveTextContent(h.status.guest);
  });

  it.each([['idle', 'synced'], ['syncing', 'syncing'], ['error', 'error']] as const)('should show a signed in rider with the sync state %s as "%s"', async (sync, key) => {
    await setup(locale, { signedIn: true, sync });
    expect(screen.getByTestId('header-status')).toHaveTextContent(h.status[key]);
  });

  it('should not be printed with the report', async () => {
    await setup(locale);
    expect(screen.getByTestId('app-header').className).toContain('print:hidden');
  });
});
