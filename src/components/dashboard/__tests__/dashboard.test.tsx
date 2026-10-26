import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { DEFAULT_PROFILE, deriveCoordinates, type ProfileValues } from '@/lib/profile/values';
import { formatDay } from '@/components/profile/format';
import type { BikeProfile } from '@/lib/passport/types';
import { Dashboard, type DashboardProps } from '../Dashboard';

const bike = (over: Partial<BikeProfile> = {}): BikeProfile => ({ id: 'current', name: null, factoryName: null, year: null, size: null, isStock: false, diagnosis: null, isActive: false, discipline: 'road', ...over });
const bikes = [bike({ id: 'a', name: 'Road bike', isActive: true }), bike({ id: 'b', name: 'Gravel bike', isStock: true })];
const rider: ProfileValues = { ...DEFAULT_PROFILE, inseamMm: 840, currentPains: ['numb_hands', 'neck_pain'], hamstringTest: 'low', releaseTest: null, lastDiagnosis: { at: '2026-10-23', saddleDeltaMm: 0, spacerDeltaMm: 0 } };

function setup(locale: Locale, over: Partial<DashboardProps> = {}) {
  const props: DashboardProps = {
    t: translations[locale], locale, values: rider, coordinates: deriveCoordinates(rider), garage: { bikes, activeBikeId: 'a' }, setupDone: true,
    onSwitchBike: vi.fn(), onStart: vi.fn(), onCheckBike: vi.fn(), onOpenProfile: vi.fn(), onTakeTests: vi.fn(), ...over,
  };
  render(<Dashboard {...props} />);
  return props;
}

describe.each(['en', 'cs'] as Locale[])('the dashboard (%s)', (locale) => {
  const d = translations[locale].shell.dashboard;
  const coordinates = deriveCoordinates(rider);

  it('should show the title and the five numbers of the active bike from the passport, nothing invented', () => {
    setup(locale);
    expect(screen.getByRole('heading', { level: 1, name: d.title })).toBeInTheDocument();
    expect(screen.getByTestId('kpi-saddle')).toHaveTextContent(`${coordinates.saddle.heightAlongTubeMm}`);
    expect(screen.getByTestId('kpi-stack')).toHaveTextContent(`${coordinates.cockpit.stackYMm}`);
    expect(screen.getByTestId('kpi-setback')).toHaveTextContent(`${Math.abs(coordinates.saddle.setbackXMm)}`);
    expect(screen.getByTestId('kpi-symptoms')).toHaveTextContent('2');
    expect(screen.getByTestId('kpi-diagnosis')).toHaveTextContent(formatDay('2026-10-23', locale));
    expect(screen.getAllByTestId(/^kpi-(saddle|stack|setback|symptoms|diagnosis)$/)).toHaveLength(5);
  });

  it('should show the effect of the mobility test in the numbers (a low hamstring result raises the stack by 18 mm)', () => {
    const plain = deriveCoordinates({ ...rider, hamstringTest: null });
    expect(coordinates.cockpit.stackYMm - plain.cockpit.stackYMm).toBe(18);
    setup(locale);
    expect(screen.getByTestId('kpi-stack')).toHaveTextContent(String(plain.cockpit.stackYMm + 18));
  });

  it('should say "not set up yet" instead of the numbers of a default rider before the setup guide was finished', () => {
    setup(locale, { setupDone: false, values: { ...DEFAULT_PROFILE }, coordinates: deriveCoordinates(DEFAULT_PROFILE) });
    for (const id of ['kpi-saddle', 'kpi-stack', 'kpi-setback', 'kpi-symptoms']) expect(screen.getByTestId(id)).toHaveTextContent(d.notSetUp);
    expect(screen.getByTestId('kpi-diagnosis')).toHaveTextContent(d.noDiagnosis);
    expect(screen.getByTestId('overview')).toHaveTextContent(d.overview.empty);
    expect(screen.queryByTestId('overview')?.querySelector('svg')).toBeNull();
  });

  it('should say that no symptom was reported, and draw the CAD overview when the setup is done', () => {
    setup(locale, { values: { ...rider, currentPains: [] } });
    expect(screen.getByTestId('kpi-symptoms')).toHaveTextContent(d.symptomsNone);
    expect(screen.getByTestId('overview').querySelector('svg')).not.toBeNull();
  });

  it('should draw the call to action as a white M3 card with a tinted head and a blue primary button, not as a dark block', () => {
    setup(locale);
    const hero = screen.getByTestId('hero');
    expect(hero.className).toContain('bg-surface');
    expect(hero.className).toContain('border-line');
    expect(hero.className).toContain('shadow-sm');
    expect(hero.className).not.toMatch(/bg-section|bg-slate-9|bg-black|text-on-section/);
    expect(hero.querySelector('.bg-tone-info-bg')).not.toBeNull();
    expect(screen.getByRole('button', { name: d.hero.start }).className).toContain('bg-blue-600');
    expect(screen.getByRole('button', { name: d.hero.checkBike }).className).toContain('border-line');
  });

  it('should fill the call to action card with the steps of the setup guide: numbered before it was finished, checked after', () => {
    const { unmount } = render(<Dashboard t={translations[locale]} locale={locale} values={rider} coordinates={coordinates} garage={{ bikes, activeBikeId: 'a' }} setupDone={false} onSwitchBike={vi.fn()} onStart={vi.fn()} onCheckBike={vi.fn()} onOpenProfile={vi.fn()} onTakeTests={vi.fn()} />);
    const steps = within(screen.getByTestId('hero-steps')).getAllByRole('listitem');
    expect(steps.map((item) => item.textContent)).toEqual(['1', '2', '3', '4', '5'].map((n, index) => `${n}${Object.values(translations[locale].navigation.journeySteps)[index]}`));
    unmount();
    setup(locale);
    expect(within(screen.getByTestId('hero-steps')).getAllByRole('listitem').every((item) => item.textContent?.startsWith('✓'))).toBe(true);
    expect(screen.getByText(d.hero.stepsTitle)).toBeInTheDocument();
  });

  it('should start the page with its own title, with no bar above it inside the dashboard', () => {
    setup(locale);
    expect(screen.getByTestId('dashboard').firstElementChild).toBe(screen.getByTestId('page-header'));
    expect(screen.getByRole('heading', { level: 1, name: d.title })).toBeInTheDocument();
  });

  it('should lead the call to action to the setup guide and the check of a bike', () => {
    const props = setup(locale);
    fireEvent.click(screen.getByRole('button', { name: d.hero.start }));
    fireEvent.click(screen.getByRole('button', { name: d.hero.checkBike }));
    expect(props.onStart).toHaveBeenCalledTimes(1);
    expect(props.onCheckBike).toHaveBeenCalledTimes(1);
  });

  it('should list the garage with the active bike marked and switch to another bike', () => {
    const props = setup(locale);
    const cards = screen.getAllByTestId('dashboard-bike');
    expect(cards).toHaveLength(2);
    expect(within(cards[0]).getByText(d.garage.active)).toBeInTheDocument();
    expect(within(cards[1]).getByText(d.garage.factory)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: `${d.garage.makeActive}: Gravel bike` }));
    expect(props.onSwitchBike).toHaveBeenCalledWith('b');
  });

  it('should tell a guest to sign in for more bikes, and offer the garage of the profile to a signed in rider only', () => {
    const props = setup(locale);
    expect(screen.getByText(d.garage.signInHint)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: d.garage.manage })).not.toBeInTheDocument();
    expect(props.onOpenProfile).not.toHaveBeenCalled();
  });

  it('should show the answers of the mini-tests or that they were not done, and lead to them', () => {
    const props = setup(locale, { values: { ...rider, hamstringTest: 'low', releaseTest: 'slumping' } });
    const card = within(screen.getByTestId('dashboard-minitests'));
    expect(card.getByText(d.miniTests.answers.low)).toBeInTheDocument();
    expect(card.getByText(d.miniTests.answers.slumping)).toBeInTheDocument();
    fireEvent.click(card.getByRole('button', { name: d.miniTests.take }));
    expect(props.onTakeTests).toHaveBeenCalledTimes(1);
  });

  it('should say "not done" for a test without an answer', () => {
    setup(locale, { values: { ...rider, hamstringTest: null, releaseTest: null } });
    expect(within(screen.getByTestId('dashboard-minitests')).getAllByText(d.miniTests.notDone)).toHaveLength(2);
  });

  it('should show bAIkcare and bAIkshop as tiles that cannot be clicked, with their description and the badge', () => {
    setup(locale);
    const tiles = within(screen.getByTestId('module-tiles'));
    expect(tiles.getByRole('heading', { name: d.modules.care.title })).toBeInTheDocument();
    expect(tiles.getByText(d.modules.shop.text)).toBeInTheDocument();
    expect(tiles.getAllByText(d.modules.comingSoon)).toHaveLength(2);
    expect(tiles.queryAllByRole('button')).toHaveLength(0);
    expect(tiles.queryAllByRole('link')).toHaveLength(0);
  });

  it('should have no avatar, no search field, no emoji and no invented ride data', () => {
    const { container } = render(<Dashboard t={translations[locale]} locale={locale} values={rider} coordinates={coordinates} garage={{ bikes, activeBikeId: 'a' }} setupDone onSwitchBike={vi.fn()} onStart={vi.fn()} onCheckBike={vi.fn()} onOpenProfile={vi.fn()} onTakeTests={vi.fn()} />);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('input[type="search"], input[type="text"]')).toBeNull();
    expect(container.textContent).not.toMatch(/\p{Extended_Pictographic}/u);
    expect(container.textContent).not.toMatch(/cadence|power output|ride score|distance|RPM|\bkm\b/i);
  });
});
