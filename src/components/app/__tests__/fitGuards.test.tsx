import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, renderHook, screen, fireEvent, within, act } from '@testing-library/react';
import HomePage from '@/app/page';
import { translations, type Locale } from '@/lib/i18n/translations';
import { DEFAULT_PROFILE, deriveCoordinates } from '@/lib/profile/values';
import { profileToPassport } from '@/lib/passport/mappers';
import { saveLocalPassport } from '@/lib/passport/localStore';
import type { BikeProfile } from '@/lib/passport/types';
import { shortKind } from '@/components/garage/bikeLabels';
import { addBikeFromSidebar, pickLanguage } from '@/test/accountMenu';
import { hasBikeSetup, useFitGate } from '../fitGuards';

const bike = (over: Partial<BikeProfile> = {}): BikeProfile => ({ id: 'b', name: null, factoryName: null, year: null, size: null, isStock: false, diagnosis: null, isActive: true, discipline: 'road', ...over });

describe('hasBikeSetup', () => {
  it('should be true for a bike with a diagnosis, a factory bike or a measured setup, and false for an empty bike', () => {
    const empty = { currentSaddleHeightMm: null, currentBarWidthMm: null };
    expect(hasBikeSetup(undefined, empty)).toBe(false);
    expect(hasBikeSetup(bike(), empty)).toBe(false);
    expect(hasBikeSetup(bike({ diagnosis: { at: '2026-10-23', saddleDeltaMm: 0, spacerDeltaMm: 0 } }), empty)).toBe(true);
    expect(hasBikeSetup(bike({ isStock: true }), empty)).toBe(true);
    expect(hasBikeSetup(bike({ factoryName: 'Cube' }), empty)).toBe(true);
    expect(hasBikeSetup(bike(), { currentSaddleHeightMm: 700, currentBarWidthMm: null })).toBe(true);
    expect(hasBikeSetup(bike(), { currentSaddleHeightMm: null, currentBarWidthMm: 420 })).toBe(true);
  });
});

describe('useFitGate', () => {
  const gate = (mode: Parameters<typeof useFitGate>[0], bikeId: string | undefined, count: number, fromProfile = false) => renderHook((props) => useFitGate(props.mode, props.bikeId, props.count, props.fromProfile), { initialProps: { mode, bikeId, count, fromProfile } });

  it('should ask only when the guide is entered on an account with several bikes, not from the profile page', () => {
    expect(gate('wizard', 'a', 2).result.current.open).toBe(true);
    expect(gate('wizard', 'a', 1).result.current.open).toBe(false);
    expect(gate('wizard', 'a', 2, true).result.current.open).toBe(false);
    expect(gate('report', 'a', 2).result.current.open).toBe(false);
    expect(gate('wizard', undefined, 2).result.current.open).toBe(false);
  });

  it('should keep the answer for that bike, ask again after the dashboard or the start page, and count a bike chosen inside the guide as the answer', () => {
    const { result, rerender } = gate('wizard', 'a', 2);
    act(() => result.current.confirm());
    expect(result.current.open).toBe(false);
    rerender({ mode: 'report', bikeId: 'a', count: 2, fromProfile: false });
    rerender({ mode: 'wizard', bikeId: 'a', count: 2, fromProfile: false });
    expect(result.current.open).toBe(false);
    rerender({ mode: 'wizard', bikeId: 'b', count: 2, fromProfile: false });
    expect(result.current.open).toBe(false);
    rerender({ mode: 'entry', bikeId: 'b', count: 2, fromProfile: false });
    rerender({ mode: 'wizard', bikeId: 'b', count: 2, fromProfile: false });
    expect(result.current.open).toBe(true);
  });

  it('should ask again when the bike changes outside of the guide', () => {
    const { result, rerender } = gate('wizard', 'a', 2);
    act(() => result.current.confirm());
    rerender({ mode: 'report', bikeId: 'a', count: 2, fromProfile: false });
    rerender({ mode: 'report', bikeId: 'b', count: 2, fromProfile: false });
    rerender({ mode: 'wizard', bikeId: 'b', count: 2, fromProfile: false });
    expect(result.current.open).toBe(true);
  });
});

describe.each(['en', 'cs'] as Locale[])('the settings of the bike are protected in the app (%s)', (locale) => {
  const t = translations[locale];
  const r = t.riders;
  beforeEach(() => localStorage.clear());
  const start = () => fireEvent.click(screen.getByText(t.shell.dashboard.hero.start));
  const setup = () => {
    render(<HomePage />);
    if (locale === 'cs') pickLanguage('CS');
  };
  /** A second bike, so that the account has two; it becomes the active bike. */
  const addSecondBike = () => {
    addBikeFromSidebar(t);
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(t.profile.garage.nameLabel), { target: { value: 'Winter bike' } });
    fireEvent.click(within(dialog).getByRole('button', { name: t.profile.garage.create }));
  };

  it('should name the bike in a bar over the wizard, the report and the other fitting screens, and not ask on an account with one bike', () => {
    setup();
    start();
    expect(screen.queryByTestId('fit-gate')).toBeNull();
    expect(screen.getByTestId('fitting-bar')).toHaveTextContent(r.fittingBar.replace('{bike}', t.profile.garage.unnamed));
    expect(screen.queryByTestId('fitting-bar-rider')).toBeNull();
    expect(screen.queryByTestId('wizard-active-bike')).toBeNull();
  });

  it('should ask which bike is fitted when the guide is entered with two bikes, and carry on with the answer', () => {
    setup();
    addSecondBike();
    fireEvent.click(screen.getByText(t.common.appTitle));
    start();
    const gate = screen.getByRole('dialog', { name: r.gateTitle });
    expect(gate).toHaveTextContent(r.gateBodySolo.replace('{bike}', 'Winter bike'));
    fireEvent.click(within(gate).getByRole('button', { name: r.gateContinue }));
    expect(screen.queryByTestId('fit-gate')).toBeNull();
    expect(screen.getByTestId('discipline-step')).toBeInTheDocument();
    expect(screen.getByTestId('fitting-bar')).toHaveTextContent('Winter bike');
  });

  it('should go back to the dashboard from the question, and let the rider switch the bike from it', () => {
    setup();
    addSecondBike();
    fireEvent.click(screen.getByText(t.common.appTitle));
    start();
    fireEvent.click(within(screen.getByTestId('fit-gate')).getByRole('button', { name: r.gateCancel }));
    expect(screen.queryByTestId('fit-gate')).toBeNull();
    expect(screen.getByRole('heading', { level: 1, name: t.shell.dashboard.title })).toBeInTheDocument();
    start();
    fireEvent.click(within(screen.getByTestId('fit-gate')).getByRole('button', { name: r.gateSwitch }));
    expect(screen.getByRole('dialog', { name: t.profile.garage.dialogTitle })).toBeInTheDocument();
  });

  it('should ask before the kind of a bike that has a setup is changed, change it on confirmation and keep it on cancel', () => {
    const values = { ...DEFAULT_PROFILE, currentSaddleHeightMm: 700 };
    saveLocalPassport(profileToPassport(values, deriveCoordinates(values)));
    setup();
    start();
    const gravel = t.studio.disciplines.gravel;
    fireEvent.click(screen.getByText(gravel));
    const dialog = screen.getByRole('dialog', { name: r.kindTitle.replace('{bike}', t.profile.garage.unnamed) });
    expect(dialog).toHaveTextContent(r.kindBody.replace('{from}', shortKind(t, 'road')).replace('{to}', shortKind(t, 'gravel')));
    fireEvent.click(within(dialog).getByRole('button', { name: r.kindCancel }));
    expect(screen.queryByTestId('kind-change')).toBeNull();
    expect(screen.getByRole('button', { name: new RegExp(t.studio.disciplines.road) })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByText(gravel));
    fireEvent.click(within(screen.getByTestId('kind-change')).getByRole('button', { name: r.kindConfirm }));
    expect(screen.queryByTestId('kind-change')).toBeNull();
    expect(screen.getByRole('button', { name: new RegExp(gravel) })).toHaveAttribute('aria-pressed', 'true');
  });

  it('should not ask when the kind of an empty bike is chosen', () => {
    setup();
    start();
    fireEvent.click(screen.getByText(t.studio.disciplines.gravel));
    expect(screen.queryByTestId('kind-change')).toBeNull();
  });
});
