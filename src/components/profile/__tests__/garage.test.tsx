import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { MAX_GARAGE_BIKES } from '@/lib/passport/garage';
import type { BikeProfile } from '@/lib/passport/types';
import { GarageSection, type GarageSectionProps } from '../GarageSection';
import { formatDay } from '../format';

const bike = (over: Partial<BikeProfile> = {}): BikeProfile => ({ id: 'current', name: null, factoryName: null, year: null, size: null, isStock: false, diagnosis: null, isActive: false, discipline: 'road', ...over });
const factory = bike({ id: 'current', factoryName: 'Canyon Endurace CF 8', year: 2024, size: 'M', isStock: true, isActive: true, diagnosis: { at: '2026-10-23', saddleDeltaMm: 12, spacerDeltaMm: -10 } });
const gravel = bike({ id: 'bike-2', name: 'Gravel bike' });

function setup(locale: Locale, over: Partial<GarageSectionProps> = {}) {
  const props: GarageSectionProps = {
    t: translations[locale], locale, garage: { bikes: [factory, gravel], activeBikeId: 'current' },
    onSwitch: vi.fn(() => true), onAudit: vi.fn(), onAdd: vi.fn(() => true), onRename: vi.fn(() => true), onRemove: vi.fn(() => true), ...over,
  };
  render(<GarageSection {...props} />);
  return props;
}

describe.each(['en', 'cs'] as Locale[])('garage of the profile page (%s)', (locale) => {
  const g = translations[locale].profile.garage;
  const cards = () => screen.getAllByTestId('garage-bike').map((node) => node.closest('div[class*="flex-col"]') as HTMLElement);

  afterEach(() => vi.restoreAllMocks());

  it('should show the title, the intro and one card per bike, with the active bike marked once', () => {
    setup(locale);
    expect(screen.getByRole('heading', { level: 2, name: g.title })).toBeInTheDocument();
    expect(screen.getByText(g.intro)).toBeInTheDocument();
    expect(screen.getAllByTestId('garage-bike')).toHaveLength(2);
    expect(screen.getAllByText(g.active)).toHaveLength(1);
    expect(within(cards()[0]).getByText(g.active)).toBeInTheDocument();
  });

  it('should name a bike by its own name, else by its factory bike, else as a bike without a name', () => {
    setup(locale, { garage: { bikes: [factory, gravel, bike({ id: 'x' })], activeBikeId: 'current' } });
    expect(screen.getByRole('heading', { name: 'Canyon Endurace CF 8' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Gravel bike' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: g.unnamed })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Canyon Endurace CF 8' })).toBeInTheDocument();
  });

  it('should say whether the bike has its factory setup, its year and size, and the last diagnosis with its deltas', () => {
    setup(locale);
    const [first, second] = cards();
    expect(first).toHaveTextContent(g.factory);
    expect(first).toHaveTextContent(fill(g.yearSize, { year: 2024, size: 'M' }));
    expect(first).toHaveTextContent(formatDay('2026-10-23', locale));
    expect(within(first).getByTestId('garage-deltas')).toHaveTextContent(`${fill(g.saddleBack, { delta: 12 })}, ${fill(g.spacerRemove, { delta: 10 })}`);
    expect(second).toHaveTextContent(g.ownSetup);
    expect(second).toHaveTextContent(`${g.lastDiagnosis}: ${g.never}`);
    expect(within(second).queryByTestId('garage-deltas')).not.toBeInTheDocument();
  });

  it.each([
    [-8, 0, [fill(g.saddleForward, { delta: 8 }), g.spacerKeep]],
    [0, 20, [g.saddleKeep, fill(g.spacerAdd, { delta: 20 })]],
    [null, null, []],
  ])('should write the deltas %j and %j', (saddleDeltaMm, spacerDeltaMm, lines) => {
    setup(locale, { garage: { bikes: [bike({ isActive: true, diagnosis: { at: '2026-10-23', saddleDeltaMm, spacerDeltaMm } })], activeBikeId: 'current' } });
    if (lines.length === 0) expect(screen.queryByTestId('garage-deltas')).not.toBeInTheDocument();
    else expect(screen.getByTestId('garage-deltas')).toHaveTextContent(lines.join(', '));
  });

  it('should offer to make a bike active only for a bike that is not active, and say so when it fails', () => {
    const props = setup(locale, { onSwitch: vi.fn(() => false) });
    expect(screen.queryByRole('button', { name: `${g.makeActive}: Canyon Endurace CF 8` })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: `${g.makeActive}: Gravel bike` }));
    expect(props.onSwitch).toHaveBeenCalledWith('bike-2');
    expect(screen.getByRole('alert')).toHaveTextContent(g.failed);
  });

  it('should start a bike audit for any bike', () => {
    const props = setup(locale);
    fireEvent.click(screen.getByRole('button', { name: `${g.audit}: Gravel bike` }));
    fireEvent.click(screen.getByRole('button', { name: `${g.audit}: Canyon Endurace CF 8` }));
    expect((props.onAudit as ReturnType<typeof vi.fn>).mock.calls).toEqual([['bike-2'], ['current']]);
  });

  it('should add another bike by its name, and refuse an empty name or a name that cannot be added', () => {
    const props = setup(locale, { onAdd: vi.fn(() => false) });
    fireEvent.click(screen.getByRole('button', { name: g.add }));
    fireEvent.click(screen.getByRole('button', { name: g.create }));
    expect(screen.getByRole('alert')).toHaveTextContent(g.nameInvalid);
    expect(props.onAdd).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText(g.nameLabel), { target: { value: 'Road bike' } });
    fireEvent.click(screen.getByRole('button', { name: g.create }));
    expect(props.onAdd).toHaveBeenCalledWith('Road bike', 'road', false);
    expect(screen.getByRole('alert')).toHaveTextContent(g.failed);
  });

  it('should close the form with Cancel and keep nothing typed', () => {
    setup(locale);
    fireEvent.click(screen.getByRole('button', { name: g.add }));
    fireEvent.change(screen.getByLabelText(g.nameLabel), { target: { value: 'Draft' } });
    fireEvent.click(screen.getByRole('button', { name: g.cancel }));
    expect(screen.queryByTestId('garage-add')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: g.add }));
    expect(screen.getByLabelText(g.nameLabel)).toHaveValue('');
  });

  it('should say the garage is full instead of offering another bike', () => {
    const bikes = Array.from({ length: MAX_GARAGE_BIKES }, (_, index) => bike({ id: `b${index}`, name: `Bike ${index}`, isActive: index === 0 }));
    setup(locale, { garage: { bikes, activeBikeId: 'b0' } });
    expect(screen.getByText(g.full)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: g.add })).not.toBeInTheDocument();
  });

  it('should rename a bike: the form starts with the name, saves the new one, and stays open with a message when it is refused', () => {
    const props = setup(locale, { onRename: vi.fn(() => false) });
    fireEvent.click(screen.getByRole('button', { name: `${g.rename}: Gravel bike` }));
    const field = screen.getByLabelText(`${g.nameLabel}: Gravel bike`);
    expect(field).toHaveValue('Gravel bike');
    fireEvent.change(field, { target: { value: 'My summer road bike' } });
    fireEvent.click(screen.getByRole('button', { name: g.save }));
    expect(props.onRename).toHaveBeenCalledWith('bike-2', 'My summer road bike');
    expect(screen.getByRole('alert')).toHaveTextContent(g.nameInvalid);
    expect(screen.getByTestId('garage-rename')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: g.cancel }));
    expect(screen.queryByTestId('garage-rename')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Gravel bike' })).toBeInTheDocument();
  });

  it('should close the rename form after a saved name, and start from the factory bike name for a bike without a name of its own', () => {
    const props = setup(locale);
    fireEvent.click(screen.getByRole('button', { name: `${g.rename}: Canyon Endurace CF 8` }));
    expect(screen.getByLabelText(`${g.nameLabel}: Canyon Endurace CF 8`)).toHaveValue('Canyon Endurace CF 8');
    fireEvent.click(screen.getByRole('button', { name: g.save }));
    expect(props.onRename).toHaveBeenCalledWith('current', 'Canyon Endurace CF 8');
    expect(screen.queryByTestId('garage-rename')).not.toBeInTheDocument();
  });

  it('should delete a bike that is not active only after a second click, and say when it fails', () => {
    const props = setup(locale, { onRemove: vi.fn(() => false) });
    fireEvent.click(screen.getByRole('button', { name: `${g.remove}: Gravel bike` }));
    expect(props.onRemove).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: g.cancel }));
    expect(screen.getByRole('button', { name: `${g.remove}: Gravel bike` })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: `${g.remove}: Gravel bike` }));
    fireEvent.click(screen.getByRole('button', { name: g.confirmRemove }));
    expect(props.onRemove).toHaveBeenCalledWith('bike-2');
    expect(screen.getByRole('alert')).toHaveTextContent(g.failed);
  });

  it('should not offer to delete the active bike and say what to do, nor the only bike of the garage', () => {
    setup(locale);
    expect(screen.queryByRole('button', { name: `${g.remove}: Canyon Endurace CF 8` })).not.toBeInTheDocument();
    expect(screen.getByText(g.removeActiveHint)).toBeInTheDocument();
  });

  it('should say that the only bike cannot be deleted', () => {
    setup(locale, { garage: { bikes: [factory], activeBikeId: 'current' } });
    expect(screen.getByText(g.removeOnlyHint)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: g.remove })).not.toBeInTheDocument();
  });

  it('should show nothing while the measurements cannot be stored', () => {
    const { container } = render(<GarageSection t={translations[locale]} locale={locale} garage={null} onSwitch={vi.fn()} onAudit={vi.fn()} onAdd={vi.fn()} onRename={vi.fn()} onRemove={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('formatDay', () => {
  it('should write a day in the language of the app, and give back text that is not a day', () => {
    expect(formatDay('2026-10-23', 'en')).toMatch(/23/);
    expect(formatDay('2026-10-23', 'cs')).toMatch(/23/);
    expect(formatDay('soon', 'en')).toBe('soon');
  });
});
