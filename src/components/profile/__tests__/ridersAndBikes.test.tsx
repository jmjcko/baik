import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { MAX_GARAGE_BIKES } from '@/lib/passport/garage';
import type { BikeProfile, RiderSummary } from '@/lib/passport/types';
import { riderName } from '@/components/riders/riderName';
import { RidersAndBikes, type GarageProps, type RiderProps } from '../RidersAndBikes';
import { DEFAULT_PROFILE } from '@/lib/profile/values';
import { formatDay } from '../format';

const bike = (over: Partial<BikeProfile> = {}): BikeProfile => ({ id: 'current', name: null, factoryName: null, year: null, size: null, isStock: false, diagnosis: null, isActive: false, discipline: 'road', ...over });
const factory = bike({ id: 'current', factoryName: 'Canyon Endurace CF 8', year: 2024, size: 'M', isStock: true, isActive: true, diagnosis: { at: '2026-10-23', saddleDeltaMm: 12, spacerDeltaMm: -10 } });
const gravel = bike({ id: 'bike-2', name: 'Gravel bike' });
const mtb = bike({ id: 'bike-3', name: 'Trail bike', discipline: 'xc_mtb' });
const people: RiderSummary[] = [{ id: 'me', name: null, isActive: true, bikeIds: ['current'] }, { id: 'r2', name: 'Eva', isActive: false, bikeIds: ['bike-2', 'bike-3'] }];

const values = { ...DEFAULT_PROFILE, inseamMm: 850, currentPains: ['numb_hands' as const, 'front_knee' as const], currentSaddleHeightMm: 700 };
type Over = { garage?: Partial<GarageProps>; riders?: Partial<RiderProps>; values?: typeof values };

function setup(locale: Locale, over: Over = {}) {
  const garage: GarageProps = { garage: { bikes: [factory, gravel, mtb], activeBikeId: 'current' }, onSwitch: vi.fn(() => true), onAudit: vi.fn(), onAdd: vi.fn(() => true), onRename: vi.fn(() => true), onRemove: vi.fn(() => true), ...over.garage };
  const riders: RiderProps = { riders: { riders: people, activeRiderId: 'me' }, onSwitch: vi.fn(() => true), onAdd: vi.fn(() => true), onRename: vi.fn(() => true), onRemove: vi.fn(() => true), onGiveBike: vi.fn(() => true), ...over.riders };
  const entered = { values: over.values ?? values, anatomy: { footLengthMm: 265, waistCircumferenceCm: 84 }, onChange: vi.fn() };
  const view = render(<RidersAndBikes t={translations[locale]} locale={locale} garage={garage} riders={riders} entered={entered} />);
  return { garage, riders, entered, ...view };
}

describe.each(['en', 'cs'] as Locale[])('riders and bikes of the profile page (%s)', (locale) => {
  const t = translations[locale];
  const r = t.riders;
  const g = t.profile.garage;
  const selectRider = (index: number) => fireEvent.click(screen.getAllByTestId('rider-portrait')[index]);
  const openMenu = (label: string, subject: string) => fireEvent.click(screen.getByRole('button', { name: `${label}: ${subject}` }));
  const choose = (name: string) => fireEvent.click(screen.getByRole('menuitem', { name }));

  afterEach(() => vi.restoreAllMocks());

  it('should show the title, one portrait per rider (the first one as "Me" / "Ja") with the active one marked, and the bikes of the active rider', () => {
    setup(locale);
    expect(screen.getByRole('heading', { level: 2, name: r.title })).toBeInTheDocument();
    const portraits = screen.getAllByTestId('rider-portrait');
    expect(portraits).toHaveLength(2);
    expect(portraits[0]).toHaveTextContent(r.me);
    expect(portraits[0]).toHaveTextContent(r.active);
    expect(portraits[0]).toHaveAttribute('aria-pressed', 'true');
    expect(portraits[1]).toHaveTextContent(`${r.bikesLabel}: 2`);
    expect(screen.getAllByTestId('garage-bike')).toHaveLength(1);
    expect(screen.getByRole('heading', { name: 'Canyon Endurace CF 8' })).toBeInTheDocument();
    expect(riderName(t, null)).toBe(r.me);
  });

  it('should show the bikes of the chosen rider and draw each bike and each rider as a picture without a text of its own', () => {
    const { container } = setup(locale);
    selectRider(1);
    expect(screen.getAllByTestId('garage-bike')).toHaveLength(2);
    expect(screen.getByRole('heading', { name: 'Gravel bike' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Trail bike' })).toBeInTheDocument();
    expect(screen.getAllByTestId('rider-portrait')[1]).toHaveAttribute('aria-pressed', 'true');
    expect(container.querySelectorAll('li svg')).toHaveLength(2);
    expect(container.querySelectorAll('[data-testid="rider-portrait"] svg[aria-hidden="true"]')).toHaveLength(2);
    expect(container.querySelector('li svg text')).toBeNull();
  });

  it('should make a rider active only when they have a bike, and say that a rider without a bike has none', () => {
    const withKid: RiderSummary[] = [...people, { id: 'r3', name: 'Kid', isActive: false, bikeIds: [] }];
    const { riders } = setup(locale, { riders: { riders: { riders: withKid, activeRiderId: 'me' } } });
    selectRider(1);
    fireEvent.click(screen.getByRole('button', { name: `${r.makeActive}: Eva` }));
    expect(riders.onSwitch).toHaveBeenCalledWith('r2');
    selectRider(2);
    expect(screen.queryByRole('button', { name: `${r.makeActive}: Kid` })).toBeNull();
    expect(screen.getAllByText(r.noBikeStatus).length).toBeGreaterThan(0);
    expect(screen.getByText(new RegExp(r.noBikes))).toBeInTheDocument();
  });

  it('should rename a rider from the menu and say when the name cannot be used', () => {
    const onRename = vi.fn().mockReturnValueOnce(false).mockReturnValue(true);
    setup(locale, { riders: { onRename } });
    selectRider(1);
    openMenu(r.moreActions, 'Eva');
    choose(r.rename);
    fireEvent.change(screen.getByLabelText(`${r.nameLabel}: Eva`), { target: { value: 'Eva N.' } });
    fireEvent.click(screen.getByRole('button', { name: r.save }));
    expect(screen.getByRole('alert')).toHaveTextContent(r.nameInvalid);
    fireEvent.click(screen.getByRole('button', { name: r.save }));
    expect(onRename).toHaveBeenLastCalledWith('r2', 'Eva N.');
    expect(screen.queryByTestId('rider-rename')).toBeNull();
  });

  it('should remove a rider only after the menu and a confirmation, and hand the bikes to the chosen rider', () => {
    const { riders } = setup(locale);
    selectRider(1);
    openMenu(r.moreActions, 'Eva');
    choose(r.remove);
    expect(riders.onRemove).not.toHaveBeenCalled();
    expect(screen.getByLabelText(r.takeoverLabel)).toHaveValue('me');
    fireEvent.click(screen.getByRole('button', { name: r.confirmRemove }));
    expect(riders.onRemove).toHaveBeenCalledWith('r2', 'me');
  });

  it('should not allow removing the only rider and say why', () => {
    setup(locale, { riders: { riders: { riders: [people[0]], activeRiderId: 'me' } } });
    openMenu(r.moreActions, r.me);
    expect(screen.getByRole('menuitem', { name: r.remove })).toBeDisabled();
    expect(screen.getByText(r.lastRider)).toBeInTheDocument();
  });

  it('should add a rider with a new bike (name and kind) after the note about the body data of another person', () => {
    const { riders } = setup(locale);
    fireEvent.click(screen.getByTestId('rider-add-open'));
    expect(screen.getByTestId('rider-consent')).toHaveTextContent(r.consent);
    fireEvent.click(screen.getByTestId('rider-bike-mode-new'));
    fireEvent.change(screen.getByTestId('rider-add-name'), { target: { value: 'Anna' } });
    fireEvent.change(screen.getByTestId('rider-add-bike'), { target: { value: 'Anna MTB' } });
    fireEvent.click(screen.getByRole('button', { name: t.studio.disciplines.xc_mtb.split(' ')[0] }));
    fireEvent.click(screen.getByRole('button', { name: r.create }));
    expect(riders.onAdd).toHaveBeenCalledWith('Anna', { bikeName: 'Anna MTB', discipline: 'xc_mtb' });
  });

  it('should add a rider with a bike the account already has, offered as "bike, now: rider", and warn when its rider is left without one', () => {
    const { riders } = setup(locale);
    fireEvent.click(screen.getByTestId('rider-add-open'));
    expect(screen.getByTestId('rider-bike-mode-existing')).toHaveAttribute('aria-pressed', 'true');
    fireEvent.change(screen.getByTestId('rider-add-name'), { target: { value: 'Anna' } });
    expect(within(screen.getByTestId('rider-add')).getByRole('option', { name: fill(r.bikeNow, { bike: 'Canyon Endurace CF 8', rider: r.me }) })).toBeInTheDocument();
    fireEvent.change(screen.getByTestId('rider-existing-bike'), { target: { value: 'current' } });
    expect(screen.getByTestId('rider-leaves-without')).toHaveTextContent(fill(r.leavesWithout, { name: r.me }));
    fireEvent.change(screen.getByTestId('rider-existing-bike'), { target: { value: 'bike-2' } });
    expect(screen.queryByTestId('rider-leaves-without')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: r.create }));
    expect(riders.onAdd).toHaveBeenCalledWith('Anna', { existingBikeId: 'bike-2' });
  });

  it('should ask for a bike when none was chosen, refuse an empty name and report a failed add', () => {
    setup(locale, { riders: { onAdd: vi.fn(() => false) } });
    fireEvent.click(screen.getByTestId('rider-add-open'));
    fireEvent.click(screen.getByRole('button', { name: r.create }));
    expect(screen.getByRole('alert')).toHaveTextContent(r.nameInvalid);
    fireEvent.change(screen.getByTestId('rider-add-name'), { target: { value: 'Anna' } });
    fireEvent.click(screen.getByRole('button', { name: r.create }));
    expect(screen.getByRole('alert')).toHaveTextContent(r.chooseBike);
    fireEvent.change(screen.getByTestId('rider-existing-bike'), { target: { value: 'bike-2' } });
    fireEvent.click(screen.getByRole('button', { name: r.create }));
    expect(screen.getByRole('alert')).toHaveTextContent(r.failed);
  });

  it('should give a bike to another rider from the "More" menu of the bike', () => {
    const { riders } = setup(locale);
    selectRider(1);
    openMenu(r.moreActions, 'Gravel bike');
    choose(fill(r.giveToRider, { rider: r.me }));
    expect(riders.onGiveBike).toHaveBeenCalledWith('bike-2', 'me');
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('should take a bike of another rider with "Add a bike", and offer a new bike in the same menu', () => {
    const { riders, garage } = setup(locale);
    selectRider(1);
    openMenu(r.addBikeAction, 'Eva');
    choose(fill(r.bikeNow, { bike: 'Canyon Endurace CF 8', rider: r.me }));
    expect(riders.onGiveBike).toHaveBeenCalledWith('current', 'r2');
    openMenu(r.addBikeAction, 'Eva');
    choose(r.newBike);
    fireEvent.change(screen.getByLabelText(g.nameLabel), { target: { value: 'Road bike' } });
    fireEvent.click(screen.getByRole('button', { name: g.create }));
    expect(garage.onAdd).toHaveBeenCalledWith('Road bike', 'road', false, 'r2');
    expect(screen.queryByTestId('garage-add')).toBeNull();
  });

  it('should close the form of a new bike with Cancel and keep nothing typed', () => {
    setup(locale);
    openMenu(r.addBikeAction, r.me);
    choose(r.newBike);
    fireEvent.change(screen.getByLabelText(g.nameLabel), { target: { value: 'Draft' } });
    fireEvent.click(screen.getByRole('button', { name: g.cancel }));
    expect(screen.queryByTestId('garage-add')).toBeNull();
    openMenu(r.addBikeAction, r.me);
    choose(r.newBike);
    expect(screen.getByLabelText(g.nameLabel)).toHaveValue('');
  });

  it('should say the garage is full instead of offering another bike', () => {
    const bikes = Array.from({ length: MAX_GARAGE_BIKES }, (_, index) => bike({ id: `b${index}`, name: `Bike ${index}`, isActive: index === 0 }));
    setup(locale, { garage: { garage: { bikes, activeBikeId: 'b0' } }, riders: { riders: { riders: [{ id: 'me', name: null, isActive: true, bikeIds: ['b0'] }], activeRiderId: 'me' } } });
    openMenu(r.addBikeAction, r.me);
    expect(screen.getByRole('menuitem', { name: r.newBike })).toBeDisabled();
    expect(screen.getByText(g.full)).toBeInTheDocument();
  });

  it('should say whether the bike has its factory setup, its year and size, and the last diagnosis with its deltas', () => {
    setup(locale);
    const first = screen.getByTestId('garage-bike');
    expect(first).toHaveTextContent(g.factory);
    expect(first).toHaveTextContent(fill(g.yearSize, { year: 2024, size: 'M' }));
    expect(first).toHaveTextContent(`${g.lastDiagnosis}${formatDay('2026-10-23', locale)}`);
    expect(within(first).getByTestId('garage-deltas')).toHaveTextContent(`${fill(g.saddleBack, { delta: 12 })}, ${fill(g.spacerRemove, { delta: 10 })}`);
    selectRider(1);
    const second = screen.getAllByTestId('garage-bike')[0];
    expect(second).toHaveTextContent(g.ownSetup);
    expect(second).toHaveTextContent(`${g.lastDiagnosis}${g.never}`);
    expect(within(second).queryByTestId('garage-deltas')).toBeNull();
  });

  it('should name a bike by its own name, else by its factory bike, else as a bike without a name', () => {
    setup(locale, { garage: { garage: { bikes: [factory, bike({ id: 'x' })], activeBikeId: 'current' } }, riders: { riders: { riders: [{ id: 'me', name: null, isActive: true, bikeIds: ['current', 'x'] }], activeRiderId: 'me' } } });
    expect(screen.getByRole('heading', { name: 'Canyon Endurace CF 8' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: g.unnamed })).toBeInTheDocument();
  });

  it.each([
    [-8, 0, [fill(g.saddleForward, { delta: 8 }), g.spacerKeep]],
    [0, 20, [g.saddleKeep, fill(g.spacerAdd, { delta: 20 })]],
    [null, null, []],
  ])('should write the deltas %j and %j', (saddleDeltaMm, spacerDeltaMm, lines) => {
    setup(locale, { garage: { garage: { bikes: [bike({ isActive: true, diagnosis: { at: '2026-10-23', saddleDeltaMm, spacerDeltaMm } })], activeBikeId: 'current' } } });
    if (lines.length === 0) expect(screen.queryByTestId('garage-deltas')).toBeNull();
    else expect(screen.getByTestId('garage-deltas')).toHaveTextContent(lines.join(', '));
  });

  it('should fill the main button of a bike: the audit for the active bike, "Make active" for the others, and say when switching fails', () => {
    const { garage } = setup(locale, { garage: { onSwitch: vi.fn(() => false) } });
    fireEvent.click(screen.getByRole('button', { name: `${g.audit}: Canyon Endurace CF 8` }));
    expect(garage.onAudit).toHaveBeenCalledWith('current');
    expect(screen.queryByRole('button', { name: `${g.makeActive}: Canyon Endurace CF 8` })).toBeNull();
    selectRider(1);
    const main = screen.getByRole('button', { name: `${g.makeActive}: Gravel bike` });
    expect(main.className).toContain('bg-blue-600');
    expect(screen.getByRole('button', { name: `${r.moreActions}: Gravel bike` }).className).not.toContain('bg-blue-600');
    fireEvent.click(main);
    expect(garage.onSwitch).toHaveBeenCalledWith('bike-2');
    expect(screen.getByRole('alert')).toHaveTextContent(g.failed);
  });

  it('should start the audit of a bike that is not active from its menu', () => {
    const { garage } = setup(locale);
    selectRider(1);
    openMenu(r.moreActions, 'Gravel bike');
    choose(g.audit);
    expect(garage.onAudit).toHaveBeenCalledWith('bike-2');
  });

  it('should rename a bike: the form starts with the name, saves the new one, and stays open with a message when it is refused', () => {
    const { garage } = setup(locale, { garage: { onRename: vi.fn(() => false) } });
    selectRider(1);
    openMenu(r.moreActions, 'Gravel bike');
    choose(g.rename);
    const field = screen.getByLabelText(`${g.nameLabel}: Gravel bike`);
    expect(field).toHaveValue('Gravel bike');
    fireEvent.change(field, { target: { value: 'Summer bike' } });
    fireEvent.click(screen.getByRole('button', { name: g.save }));
    expect(garage.onRename).toHaveBeenCalledWith('bike-2', 'Summer bike');
    expect(screen.getByRole('alert')).toHaveTextContent(g.nameInvalid);
    fireEvent.click(screen.getByRole('button', { name: g.cancel }));
    expect(screen.queryByTestId('garage-rename')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Gravel bike' })).toBeInTheDocument();
  });

  it('should start renaming a bike without a name of its own from the factory bike name and close the form once saved', () => {
    const { garage } = setup(locale);
    openMenu(r.moreActions, 'Canyon Endurace CF 8');
    choose(g.rename);
    expect(screen.getByLabelText(`${g.nameLabel}: Canyon Endurace CF 8`)).toHaveValue('Canyon Endurace CF 8');
    fireEvent.click(screen.getByRole('button', { name: g.save }));
    expect(garage.onRename).toHaveBeenCalledWith('current', 'Canyon Endurace CF 8');
    expect(screen.queryByTestId('garage-rename')).toBeNull();
  });

  it('should delete a bike that is not active only after a second step, and say when it fails', () => {
    const { garage } = setup(locale, { garage: { onRemove: vi.fn(() => false) } });
    selectRider(1);
    openMenu(r.moreActions, 'Gravel bike');
    choose(g.remove);
    expect(garage.onRemove).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: g.cancel }));
    expect(screen.queryByTestId('garage-remove')).toBeNull();
    openMenu(r.moreActions, 'Gravel bike');
    choose(g.remove);
    fireEvent.click(screen.getByRole('button', { name: g.confirmRemove }));
    expect(garage.onRemove).toHaveBeenCalledWith('bike-2');
    expect(screen.getByRole('alert')).toHaveTextContent(g.failed);
  });

  it('should not allow deleting the active bike and say what to do, nor the only bike of the garage', () => {
    const { unmount } = setup(locale);
    openMenu(r.moreActions, 'Canyon Endurace CF 8');
    expect(screen.getByRole('menuitem', { name: g.remove })).toBeDisabled();
    expect(screen.getByText(g.removeActiveHint)).toBeInTheDocument();
    unmount();
    setup(locale, { garage: { garage: { bikes: [factory], activeBikeId: 'current' } }, riders: { riders: { riders: [people[0]], activeRiderId: 'me' } } });
    openMenu(r.moreActions, 'Canyon Endurace CF 8');
    expect(screen.getByText(g.removeOnlyHint)).toBeInTheDocument();
  });

  it('should close a menu with Escape and with a click outside of it', () => {
    setup(locale);
    openMenu(r.moreActions, 'Canyon Endurace CF 8');
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).toBeNull();
    openMenu(r.moreActions, 'Canyon Endurace CF 8');
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('should say that the account is full at ten riders and show nothing while the passport cannot be stored', () => {
    const many: RiderSummary[] = Array.from({ length: 10 }, (_, i) => ({ id: `r${i}`, name: `R${i}`, isActive: i === 0, bikeIds: [] }));
    const { unmount } = setup(locale, { riders: { riders: { riders: many, activeRiderId: 'r0' } } });
    expect(screen.getByText(r.full)).toBeInTheDocument();
    expect(screen.queryByTestId('rider-add-open')).toBeNull();
    unmount();
    expect(setup(locale, { garage: { garage: null } }).container).toBeEmptyDOMElement();
    expect(setup(locale, { riders: { riders: null } }).container.querySelectorAll('section')).toHaveLength(0);
  });

  it('should list what the rider entered under "Body and tests", with the optional measurements and the symptoms marked as health data', () => {
    setup(locale);
    expect(screen.queryByTestId('rider-body')).toBeNull();
    fireEvent.click(screen.getByRole('tab', { name: t.profile.body.bodyTab }));
    expect(screen.getByText('850 mm')).toBeInTheDocument();
    expect(screen.getByText(t.studio.ridingStyles.balanced)).toBeInTheDocument();
    expect(screen.getByText(t.profile.entered.optional.footLengthMm)).toBeInTheDocument();
    expect(screen.getByText('265 mm')).toBeInTheDocument();
    expect(screen.getByText('84 cm')).toBeInTheDocument();
    expect(screen.queryByText(t.profile.entered.optional.footWidthMm)).toBeNull();
    expect(screen.getByText(t.profile.entered.healthTag)).toBeInTheDocument();
    expect(screen.getByText(t.studio.pains.numb_hands)).toBeInTheDocument();
    expect(screen.getByText(t.studio.pains.front_knee)).toBeInTheDocument();
  });

  it('should say none were reported when there are no symptoms', () => {
    setup(locale, { values: { ...values, currentPains: [] } });
    fireEvent.click(screen.getByRole('tab', { name: t.profile.body.bodyTab }));
    expect(screen.getByText(t.profile.entered.symptomsNone)).toBeInTheDocument();
  });

  it('should open the setup step of the body and of the posture from their Change buttons', () => {
    const { entered } = setup(locale);
    fireEvent.click(screen.getByRole('tab', { name: t.profile.body.bodyTab }));
    fireEvent.click(screen.getByRole('button', { name: `${t.profile.entered.change}: ${t.profile.entered.groups.body}` }));
    fireEvent.click(screen.getByRole('button', { name: `${t.profile.entered.change}: ${t.profile.entered.groups.posture}` }));
    expect(entered.onChange.mock.calls.map(([step]) => step)).toEqual(['body', 'posture']);
  });

  it('should not show the numbers of another rider, but offer to make them active', () => {
    const { riders } = setup(locale);
    selectRider(1);
    fireEvent.click(screen.getByRole('tab', { name: t.profile.body.bodyTab }));
    expect(screen.queryByTestId('rider-body')).toBeNull();
    expect(screen.getByText(fill(t.profile.body.notActive, { name: 'Eva' }))).toBeInTheDocument();
    const buttons = screen.getAllByRole('button', { name: `${r.makeActive}: Eva` });
    expect(buttons).toHaveLength(2);
    fireEvent.click(buttons[1]);
    expect(riders.onSwitch).toHaveBeenCalledWith('r2');
  });

  it('should show the setup of the active bike on one line (saddle, handlebar, crank) and nowhere else, and open the setup step from the menu', () => {
    const { entered } = setup(locale);
    expect(screen.getByTestId('bike-setup')).toHaveTextContent(fill(t.profile.body.setupLine, { saddle: '700 mm', bar: t.profile.entered.notEntered, crank: `${values.crankLengthMm} mm` }));
    openMenu(r.moreActions, 'Canyon Endurace CF 8');
    choose(g.editSetup);
    expect(entered.onChange).toHaveBeenCalledWith('bike');
    selectRider(1);
    expect(screen.queryByTestId('bike-setup')).toBeNull();
    openMenu(r.moreActions, 'Gravel bike');
    expect(screen.queryByRole('menuitem', { name: g.editSetup })).toBeNull();
  });
});

describe('formatDay', () => {
  it('should write a day in the language of the app, and give back text that is not a day', () => {
    expect(formatDay('2026-10-23', 'en')).toMatch(/23/);
    expect(formatDay('2026-10-23', 'cs')).toMatch(/23/);
    expect(formatDay('soon', 'en')).toBe('soon');
  });
});
