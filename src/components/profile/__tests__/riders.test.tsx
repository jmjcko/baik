import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { RidersSection, type RidersSectionProps } from '../RidersSection';
import { BikeRiderField } from '../BikeRiderField';
import { riderName } from '@/components/riders/riderName';

const riders = { riders: [{ id: 'me', name: null, isActive: true, bikeIds: ['b1'] }, { id: 'r2', name: 'Eva', isActive: false, bikeIds: ['b2', 'b3'] }], activeRiderId: 'me' };
const bikeNames = { b1: 'Road', b2: 'Gravel Eva', b3: 'Road Eva' };

function setup(locale: Locale, overrides: Partial<RidersSectionProps> = {}) {
  const props: RidersSectionProps = { t: translations[locale], riders, bikeNames, onSwitch: vi.fn(() => true), onAdd: vi.fn(() => true), onRename: vi.fn(() => true), onRemove: vi.fn(() => true), ...overrides };
  render(<RidersSection {...props} />);
  return props;
}

describe.each(['en', 'cs'] as Locale[])('RidersSection (%s)', (locale) => {
  const t = translations[locale];
  const r = t.riders;

  it('should list every rider with the bikes, the first rider as "Me" / "Ja" in the language of the page, and mark the active one', () => {
    setup(locale);
    const cards = screen.getAllByTestId('rider-card');
    expect(cards).toHaveLength(2);
    expect(within(cards[0]).getByRole('heading')).toHaveTextContent(r.me);
    expect(within(cards[0]).getByText(r.active)).toBeInTheDocument();
    expect(screen.getByText(fill(r.bikesOf, { list: 'Gravel Eva, Road Eva' }))).toBeInTheDocument();
    expect(riderName(t, null)).toBe(r.me);
    expect(riderName(t, 'Eva')).toBe('Eva');
  });

  it('should switch to another rider, but only one that has a bike', () => {
    const props = setup(locale, { riders: { ...riders, riders: [...riders.riders, { id: 'r3', name: 'Kid', isActive: false, bikeIds: [] }] } });
    fireEvent.click(screen.getByRole('button', { name: `${r.makeActive}: Eva` }));
    expect(props.onSwitch).toHaveBeenCalledWith('r2');
    expect(screen.queryByRole('button', { name: `${r.makeActive}: Kid` })).toBeNull();
    expect(screen.getByText(r.noBikeHint)).toBeInTheDocument();
  });

  it('should rename a rider and say when the name cannot be used', () => {
    const onRename = vi.fn().mockReturnValueOnce(false).mockReturnValue(true);
    setup(locale, { onRename });
    fireEvent.click(screen.getByRole('button', { name: `${r.rename}: Eva` }));
    fireEvent.change(screen.getByLabelText(`${r.nameLabel}: Eva`), { target: { value: 'Eva N.' } });
    fireEvent.click(screen.getByRole('button', { name: r.save }));
    expect(screen.getByRole('alert')).toHaveTextContent(r.nameInvalid);
    fireEvent.click(screen.getByRole('button', { name: r.save }));
    expect(onRename).toHaveBeenLastCalledWith('r2', 'Eva N.');
    expect(screen.queryByTestId('rider-rename')).toBeNull();
  });

  it('should remove a rider only after a second click and hand the bikes to the chosen rider', () => {
    const props = setup(locale);
    fireEvent.click(screen.getByRole('button', { name: `${r.remove}: Eva` }));
    expect(props.onRemove).not.toHaveBeenCalled();
    expect(screen.getByLabelText(r.takeoverLabel)).toHaveValue('me');
    fireEvent.click(screen.getByRole('button', { name: r.confirmRemove }));
    expect(props.onRemove).toHaveBeenCalledWith('r2', 'me');
  });

  it('should not offer to remove the only rider and say why', () => {
    setup(locale, { riders: { riders: [riders.riders[0]], activeRiderId: 'me' } });
    expect(screen.getByText(r.lastRider)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: new RegExp(r.remove) })).toBeNull();
  });

  it('should add a rider with the first bike after the note about the body data of another person', () => {
    const props = setup(locale);
    fireEvent.click(screen.getByTestId('rider-add-open'));
    expect(screen.getByTestId('rider-consent')).toHaveTextContent(r.consent);
    fireEvent.change(screen.getByTestId('rider-add-name'), { target: { value: 'Anna' } });
    fireEvent.change(screen.getByTestId('rider-add-bike'), { target: { value: 'Anna MTB' } });
    fireEvent.click(screen.getByRole('button', { name: t.studio.disciplines.xc_mtb.split(' ')[0] }));
    fireEvent.click(screen.getByRole('button', { name: r.create }));
    expect(props.onAdd).toHaveBeenCalledWith('Anna', 'Anna MTB', 'xc_mtb');
  });

  it('should refuse an empty name and report a failed add', () => {
    setup(locale, { onAdd: vi.fn(() => false) });
    fireEvent.click(screen.getByTestId('rider-add-open'));
    fireEvent.click(screen.getByRole('button', { name: r.create }));
    expect(screen.getByRole('alert')).toHaveTextContent(r.nameInvalid);
    fireEvent.change(screen.getByTestId('rider-add-name'), { target: { value: 'Anna' } });
    fireEvent.change(screen.getByTestId('rider-add-bike'), { target: { value: 'Bike' } });
    fireEvent.click(screen.getByRole('button', { name: r.create }));
    expect(screen.getByRole('alert')).toHaveTextContent(r.failed);
  });

  it('should say that the account is full at ten riders and show nothing without riders', () => {
    const many = Array.from({ length: 10 }, (_, i) => ({ id: `r${i}`, name: `R${i}`, isActive: i === 0, bikeIds: [`b${i}`] }));
    const { unmount } = render(<RidersSection t={t} riders={{ riders: many, activeRiderId: 'r0' }} bikeNames={{}} onSwitch={vi.fn()} onAdd={vi.fn()} onRename={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText(r.full)).toBeInTheDocument();
    expect(screen.queryByTestId('rider-add-open')).toBeNull();
    unmount();
    const empty = render(<RidersSection t={t} riders={null} bikeNames={{}} onSwitch={vi.fn()} onAdd={vi.fn()} onRename={vi.fn()} onRemove={vi.fn()} />);
    expect(empty.container).toBeEmptyDOMElement();
  });

  it('should let the rider of a bike be changed on the bike card', () => {
    const onAssign = vi.fn();
    render(<BikeRiderField t={t} bikeTitle="Road" riderId="me" choices={[{ id: 'me', label: r.me }, { id: 'r2', label: 'Eva' }]} onAssign={onAssign} />);
    fireEvent.change(screen.getByLabelText(`${r.riderOfBike}: Road`), { target: { value: 'r2' } });
    expect(onAssign).toHaveBeenCalledWith('r2');
  });
});
