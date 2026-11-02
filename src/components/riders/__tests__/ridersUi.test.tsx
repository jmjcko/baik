import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { Sidebar } from '@/components/navigation/Sidebar';
import { BikeDialog } from '@/components/garage/BikeDialog';
import { BikePicker } from '@/components/maintain/BikePicker';
import { RiderLine } from '../RiderLine';
import type { BikeProfile } from '@/lib/passport/types';

const bike = (id: string, riderId: string, isActive = false): BikeProfile => ({ id, name: `Bike ${id}`, factoryName: null, year: null, size: null, isStock: false, diagnosis: null, isActive, discipline: 'road', riderId });
const garage = { bikes: [bike('b1', 'me', true), bike('b2', 'r2')], activeBikeId: 'b1' };
const two = { riders: [{ id: 'me', name: null, isActive: true, bikeIds: ['b1'] }, { id: 'r2', name: 'Eva', isActive: false, bikeIds: ['b2'] }], activeRiderId: 'me' };
const one = { riders: [two.riders[0]], activeRiderId: 'me' };
const controls = { theme: 'light' as const, onSetLocale: vi.fn(), onSetTheme: vi.fn() };

describe.each(['en', 'cs'] as Locale[])('riders in the screens (%s)', (locale) => {
  const t = translations[locale];

  it('should show the rider switch and the rider of each bike in the sidebar when there are two riders, and switch on a click', () => {
    const onSwitchRider = vi.fn();
    render(<Sidebar t={t} currentMode="entry" onSelectMode={vi.fn()} locale={locale} {...controls} garage={garage} onSwitchBike={vi.fn()} riders={two} onSwitchRider={onSwitchRider} />);
    expect(screen.getByTestId('sidebar-rider-me')).toHaveTextContent(t.riders.me);
    expect(screen.getByTestId('sidebar-rider-me')).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByTestId('sidebar-rider-r2'));
    expect(onSwitchRider).toHaveBeenCalledWith('r2');
    expect(screen.getAllByTestId('bike-rider').map((node) => node.textContent)).toEqual([t.riders.me, 'Eva']);
  });

  it('should show nothing new in the sidebar for a single rider', () => {
    render(<Sidebar t={t} currentMode="entry" onSelectMode={vi.fn()} locale={locale} {...controls} garage={garage} onSwitchBike={vi.fn()} riders={one} onSwitchRider={vi.fn()} />);
    expect(screen.queryByTestId('sidebar-riders')).toBeNull();
    expect(screen.queryByTestId('bike-rider')).toBeNull();
  });

  it('should not let a rider without a bike be switched to', () => {
    const noBike = { riders: [...two.riders, { id: 'r3', name: 'Kid', isActive: false, bikeIds: [] }], activeRiderId: 'me' };
    render(<Sidebar t={t} currentMode="entry" onSelectMode={vi.fn()} locale={locale} {...controls} garage={garage} onSwitchBike={vi.fn()} riders={noBike} onSwitchRider={vi.fn()} />);
    expect(screen.getByTestId('sidebar-rider-r3')).toBeDisabled();
  });

  it('should say "For: <rider>" with two riders and stay silent with one', () => {
    const { rerender } = render(<RiderLine t={t} riders={two} />);
    expect(screen.getByTestId('for-rider')).toHaveTextContent(fill(t.riders.forLine, { name: t.riders.me }));
    rerender(<RiderLine t={t} riders={{ ...two, activeRiderId: 'r2' }} />);
    expect(screen.getByTestId('for-rider')).toHaveTextContent(fill(t.riders.forLine, { name: 'Eva' }));
    rerender(<RiderLine t={t} riders={one} />);
    expect(screen.queryByTestId('for-rider')).toBeNull();
    rerender(<RiderLine t={t} riders={null} />);
    expect(screen.queryByTestId('for-rider')).toBeNull();
  });

  it('should ask for the rider when a bike is added with two riders, and give the chosen rider to the handler', () => {
    const onAdd = vi.fn(() => true);
    render(<BikeDialog t={t} garage={garage} onSwitch={vi.fn()} onAdd={onAdd} onClose={vi.fn()} riders={[{ id: 'me', label: t.riders.me }, { id: 'r2', label: 'Eva' }]} activeRiderId="r2" />);
    expect(screen.getByLabelText(t.riders.riderOfBike)).toHaveValue('r2');
    fireEvent.change(screen.getByLabelText(t.profile.garage.nameLabel), { target: { value: 'Trail' } });
    fireEvent.click(screen.getByRole('button', { name: t.profile.garage.create }));
    expect(onAdd).toHaveBeenCalledWith('Trail', 'road', false, 'r2');
  });

  it('should not ask for the rider with one rider', () => {
    render(<BikeDialog t={t} garage={garage} onSwitch={vi.fn()} onAdd={vi.fn()} onClose={vi.fn()} riders={[{ id: 'me', label: t.riders.me }]} activeRiderId="me" />);
    expect(screen.queryByTestId('add-bike-rider')).toBeNull();
  });

  it('should name the rider next to the bike in the bAIkcare bike menu and on the button', () => {
    const bikes = [{ id: 'a', name: 'Road', rider: t.riders.me }, { id: 'b', name: 'Gravel', rider: 'Eva' }];
    render(<BikePicker t={t} bikes={bikes} activeId="a" fallbackName="Road" onSwitch={vi.fn()} />);
    expect(screen.getByTestId('care-bike-trigger')).toHaveTextContent(`Road · ${t.riders.me}`);
    fireEvent.click(screen.getByTestId('care-bike-trigger'));
    expect(screen.getByTestId('care-bike-rider-b')).toHaveTextContent('Eva');
  });
});
