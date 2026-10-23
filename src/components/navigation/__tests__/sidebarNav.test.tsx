import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import type { BikeProfile } from '@/lib/passport/types';
import { Sidebar } from '../Sidebar';

const bike = (over: Partial<BikeProfile>): BikeProfile => ({ id: 'x', name: null, factoryName: null, year: null, size: null, isStock: false, diagnosis: null, isActive: false, ...over });
const garage = { bikes: [bike({ id: 'a', name: 'Road bike', isActive: true }), bike({ id: 'b', name: 'Gravel bike' })], activeBikeId: 'a' };

describe.each(['en', 'cs'] as Locale[])('the sidebar of the Aurora shell (%s)', (locale) => {
  const t = translations[locale];
  const base = { t, currentMode: 'entry' as const, onSelectMode: vi.fn(), locale, theme: 'light' as const, onSetLocale: vi.fn(), onSetTheme: vi.fn() };
  const nav = () => within(screen.getByRole('navigation', { name: t.shell.sidebar.mainLabel }));

  it('should open the dashboard and the setup guide from the main navigation, with the current page marked', () => {
    const onSelectMode = vi.fn();
    render(<Sidebar {...base} onSelectMode={onSelectMode} currentMode="entry" />);
    expect(nav().getByRole('button', { name: t.shell.sidebar.dashboard })).toHaveAttribute('aria-current', 'page');
    fireEvent.click(nav().getByRole('button', { name: t.navigation.baikfitEngine }));
    fireEvent.click(nav().getByRole('button', { name: t.shell.sidebar.dashboard }));
    expect(onSelectMode.mock.calls).toEqual([['wizard'], ['entry']]);
  });

  it('should mark the engine as current anywhere in the setup journey', () => {
    for (const mode of ['wizard', 'report', 'studio', 'prepurchasing'] as const) {
      const { unmount } = render(<Sidebar {...base} currentMode={mode} />);
      expect(nav().getByRole('button', { name: t.navigation.baikfitEngine })).toHaveAttribute('aria-current', 'page');
      unmount();
    }
  });

  it('should show bAIkcare and bAIkshop as items that cannot be clicked, with the badge', () => {
    render(<Sidebar {...base} />);
    expect(nav().queryByRole('button', { name: t.navigation.baikcareStudio })).not.toBeInTheDocument();
    expect(nav().getByText(t.navigation.baikcareStudio)).toBeInTheDocument();
    expect(nav().getByText(t.navigation.baikshopAdvisory)).toBeInTheDocument();
    expect(nav().getAllByText(t.navigation.comingSoon)).toHaveLength(2);
  });

  it('should give every item an icon that is hidden from screen readers, next to its text label', () => {
    render(<Sidebar {...base} />);
    const icons = nav().getAllByRole('button').flatMap((button) => Array.from(button.querySelectorAll('svg')));
    expect(icons.length).toBeGreaterThanOrEqual(2);
    for (const icon of icons) expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText(t.navigation.capabilities).closest('button')?.querySelector('svg')).not.toBeNull();
  });

  it('should list "My bikes" with the active one marked, switch to another and add a bike for a signed in rider', () => {
    const onSwitchBike = vi.fn();
    const onAddBike = vi.fn();
    render(<Sidebar {...base} garage={garage} onSwitchBike={onSwitchBike} onAddBike={onAddBike} />);
    const section = within(screen.getByTestId('sidebar-garage'));
    expect(section.getByRole('button', { name: new RegExp(`Road bike.*${t.shell.sidebar.activeBike}`) })).toHaveAttribute('aria-current', 'true');
    fireEvent.click(section.getByRole('button', { name: 'Gravel bike' }));
    fireEvent.click(section.getByRole('button', { name: t.shell.sidebar.addBike }));
    expect(onSwitchBike).toHaveBeenCalledWith('b');
    expect(onAddBike).toHaveBeenCalledTimes(1);
  });

  it('should offer no way to add a bike without the handler, and say so when there is no bike', () => {
    render(<Sidebar {...base} garage={{ bikes: [], activeBikeId: 'current' }} onSwitchBike={vi.fn()} />);
    expect(screen.getByText(t.shell.sidebar.noBikes)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: t.shell.sidebar.addBike })).not.toBeInTheDocument();
  });
});
