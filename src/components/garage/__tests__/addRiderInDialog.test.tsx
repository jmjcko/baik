import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import HomePage from '@/app/page';
import { loadLocalPassport } from '@/lib/passport/localStore';
import { addRider } from '@/lib/passport/riders';
import type { BikeProfile } from '@/lib/passport/types';
import { addBikeFromSidebar, pickLanguage } from '@/test/accountMenu';
import { BikeDialog } from '../BikeDialog';

const bike = (id: string, name: string, isActive: boolean): BikeProfile => ({ id, name, factoryName: null, year: null, size: null, isStock: false, diagnosis: null, isActive, discipline: 'road' });
const garage = { activeBikeId: 'a', bikes: [bike('a', 'Road bike', true)] };

describe.each(['en', 'cs'] as Locale[])('adding a rider in the which-bike dialog (%s)', (locale) => {
  const t = translations[locale];
  const g = t.profile.garage;
  const riders = [{ id: 'r1', label: 'Me' }];
  beforeEach(() => localStorage.clear());

  const open = (onAddRider = vi.fn(() => true), onAdd = vi.fn(() => true), list = riders) => {
    const onClose = vi.fn();
    render(<BikeDialog t={t} garage={garage} onSwitch={vi.fn()} onAdd={onAdd} onAddRider={onAddRider} riders={list} activeRiderId="r1" onClose={onClose} />);
    return { onAddRider, onAdd, onClose };
  };
  const chooseNewRider = () => fireEvent.change(within(screen.getByTestId('add-bike-rider')).getByRole('combobox'), { target: { value: '__new__' } });

  it('should offer a new rider in the choice of the rider, even when the account has only one rider', () => {
    open();
    const select = within(screen.getByTestId('add-bike-rider')).getByRole('combobox');
    expect(within(select).getAllByRole('option').map((option) => option.textContent)).toEqual(['Me', t.riders.newRiderOption]);
    expect(screen.queryByTestId('add-bike-new-rider')).not.toBeInTheDocument();
  });

  it('should ask for the name of the rider, with the note about the agreement, once "New rider" is chosen', () => {
    open();
    chooseNewRider();
    expect(screen.getByTestId('add-bike-new-rider')).toHaveTextContent(t.riders.addHint);
    expect(screen.getByTestId('new-rider-name')).toHaveAttribute('maxlength', '80');
  });

  it('should add the rider with the first bike, its kind and the trainer flag in one step, and close', () => {
    const { onAddRider, onAdd, onClose } = open();
    fireEvent.change(screen.getByLabelText(g.nameLabel), { target: { value: 'Eva gravel' } });
    fireEvent.click(screen.getByRole('button', { name: /gravel/i }));
    fireEvent.click(screen.getByRole('checkbox'));
    chooseNewRider();
    fireEvent.change(screen.getByTestId('new-rider-name'), { target: { value: ' Eva ' } });
    fireEvent.click(screen.getByRole('button', { name: g.create }));
    expect(onAddRider).toHaveBeenCalledWith('Eva', { bikeName: 'Eva gravel', discipline: 'gravel', trainer: true });
    expect(onAdd).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should refuse an empty name of the rider and say so, and stay open when the rider cannot be added', () => {
    const { onAddRider, onClose } = open(vi.fn(() => false));
    fireEvent.change(screen.getByLabelText(g.nameLabel), { target: { value: 'Eva gravel' } });
    chooseNewRider();
    fireEvent.click(screen.getByRole('button', { name: g.create }));
    expect(screen.getByRole('alert')).toHaveTextContent(t.riders.nameInvalid);
    expect(onAddRider).not.toHaveBeenCalled();
    fireEvent.change(screen.getByTestId('new-rider-name'), { target: { value: 'Me' } });
    fireEvent.click(screen.getByRole('button', { name: g.create }));
    expect(onAddRider).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('alert')).toHaveTextContent(t.riders.nameInvalid);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should still add a bike for an existing rider when "New rider" is not chosen', () => {
    const { onAdd, onAddRider } = open(vi.fn(() => true), vi.fn(() => true), [{ id: 'r1', label: 'Me' }, { id: 'r2', label: 'Eva' }]);
    fireEvent.change(screen.getByLabelText(g.nameLabel), { target: { value: 'City bike' } });
    fireEvent.change(within(screen.getByTestId('add-bike-rider')).getByRole('combobox'), { target: { value: 'r2' } });
    fireEvent.click(screen.getByRole('button', { name: g.create }));
    expect(onAdd).toHaveBeenCalledWith('City bike', 'road', false, 'r2');
    expect(onAddRider).not.toHaveBeenCalled();
  });

  it('should not offer a new rider when the page gives no way to add one', () => {
    render(<BikeDialog t={t} garage={garage} onSwitch={vi.fn()} onAdd={vi.fn()} riders={riders} activeRiderId="r1" onClose={vi.fn()} />);
    expect(screen.queryByTestId('add-bike-rider')).not.toBeInTheDocument();
  });

  it('should create the rider, their bike and the trainer flag in the app, and make them the active rider', () => {
    render(<HomePage />);
    if (locale === 'cs') pickLanguage('CS');
    addBikeFromSidebar(t);
    const dialog = screen.getByRole('dialog', { name: g.dialogTitle });
    fireEvent.change(within(dialog).getByLabelText(g.nameLabel), { target: { value: 'Eva gravel' } });
    fireEvent.change(within(dialog).getByRole('combobox'), { target: { value: '__new__' } });
    fireEvent.change(within(dialog).getByTestId('new-rider-name'), { target: { value: 'Eva' } });
    fireEvent.click(within(dialog).getByRole('checkbox'));
    fireEvent.click(within(dialog).getByRole('button', { name: g.create }));
    expect(screen.queryByRole('dialog', { name: g.dialogTitle })).not.toBeInTheDocument();
    const passport = loadLocalPassport()?.passport;
    expect(passport?.riders.map((rider) => rider.name)).toContain('Eva');
    const active = passport?.bikes.find((one) => one.id === passport.activeBikeId);
    expect(active?.name).toBe('Eva gravel');
    expect(active?.care?.trainer).toBe(true);
    expect(passport?.riders.find((rider) => rider.id === active?.primaryRiderId)?.name).toBe('Eva');
  });
});

describe('the model of a new rider with a bike on a trainer', () => {
  it('should carry the trainer flag to the new bike, and default to no trainer', () => {
    const base = { discipline: 'road' as const, riders: [{ id: 'r1', name: 'Me', anatomy: { inseamMm: 840, acromionWidthMm: 420, torsoLengthMm: 620, armLengthMm: 620, heightCm: 178, weightKg: 75 }, symptoms: [] }], bikes: [{ id: 'b0', kind: 'current' as const, primaryRiderId: 'r1', name: 'Old', discipline: 'road' as const }], activeBikeId: 'b0', gear: { purchases: [] } } as never;
    const withTrainer = addRider(base, { riderId: 'r2', name: 'Eva', bikeId: 'b1', bikeName: 'Trainer bike', discipline: 'road', trainer: true });
    expect(withTrainer?.bikes.find((one) => one.id === 'b1')?.care?.trainer).toBe(true);
    const without = addRider(base, { riderId: 'r3', name: 'Tom', bikeId: 'b2', bikeName: 'Plain bike', discipline: 'road' });
    expect(without?.bikes.find((one) => one.id === 'b2')?.care?.trainer).toBeUndefined();
  });
});
