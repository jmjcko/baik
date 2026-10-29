import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import type { BikeProfile } from '@/lib/passport/types';
import { Sidebar } from '../Sidebar';

const bike = (over: Partial<BikeProfile>): BikeProfile => ({ id: 'x', name: null, factoryName: null, year: null, size: null, isStock: false, diagnosis: null, isActive: false, discipline: 'road', ...over });
const garage = { bikes: [bike({ id: 'a', name: 'Road bike', isActive: true }), bike({ id: 'b', name: 'Gravel bike' })], activeBikeId: 'a' };

describe.each(['en', 'cs'] as Locale[])('the sidebar of the Aurora shell (%s)', (locale) => {
  const t = translations[locale];
  const base = { t, currentMode: 'entry' as const, onSelectMode: vi.fn(), locale, theme: 'light' as const, onSetLocale: vi.fn(), onSetTheme: vi.fn() };
  const nav = () => within(screen.getByRole('navigation', { name: t.shell.sidebar.mainLabel }));

  const brand = () => screen.getByRole('button', { name: `${t.common.appTitle} - ${t.common.tagline}` });

  it('should open the dashboard from the logo and the bAIkfit start page from the module, with the current page marked', () => {
    const onSelectMode = vi.fn();
    render(<Sidebar {...base} onSelectMode={onSelectMode} currentMode="entry" />);
    expect(brand()).toHaveAttribute('aria-current', 'page');
    expect(brand()).toHaveAttribute('title', t.shell.sidebar.dashboard);
    fireEvent.click(nav().getByRole('button', { name: t.navigation.baikfitEngine }));
    fireEvent.click(brand());
    expect(onSelectMode.mock.calls).toEqual([['fit'], ['entry']]);
  });

  it('should have no separate dashboard link, and not mark the logo as current on another page', () => {
    render(<Sidebar {...base} currentMode="report" />);
    expect(screen.queryByRole('button', { name: t.shell.sidebar.dashboard })).not.toBeInTheDocument();
    expect(brand()).not.toHaveAttribute('aria-current');
  });

  it('should mark the engine as current anywhere in the setup journey', () => {
    for (const mode of ['wizard', 'report', 'studio', 'prepurchasing'] as const) {
      const { unmount } = render(<Sidebar {...base} currentMode={mode} />);
      expect(nav().getByRole('button', { name: t.navigation.baikfitEngine })).toHaveAttribute('aria-current', 'page');
      unmount();
    }
  });

  it('should open the bAIkcare workshop from its item, mark it as the current page, and leave only bAIkshop as an item that cannot be clicked, with the badge', () => {
    const onSelectMode = vi.fn();
    const { unmount } = render(<Sidebar {...base} onSelectMode={onSelectMode} />);
    fireEvent.click(nav().getByRole('button', { name: t.navigation.baikcareStudio }));
    expect(onSelectMode).toHaveBeenCalledWith('care');
    expect(nav().queryByRole('button', { name: t.navigation.baikshopAdvisory })).not.toBeInTheDocument();
    expect(nav().getByText(t.navigation.baikshopAdvisory)).toBeInTheDocument();
    expect(nav().getAllByText(t.navigation.comingSoon)).toHaveLength(1);
    unmount();
    render(<Sidebar {...base} currentMode="care" />);
    expect(nav().getByRole('button', { name: t.navigation.baikcareStudio })).toHaveAttribute('aria-current', 'page');
  });

  it('should give every item an icon that is hidden from screen readers, next to its text label', () => {
    render(<Sidebar {...base} />);
    const icons = Array.from(screen.getByRole('navigation', { name: t.shell.sidebar.mainLabel }).querySelectorAll('svg'));
    expect(icons).toHaveLength(3);
    for (const icon of icons) expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText(t.navigation.capabilities).closest('button')?.querySelector('svg')).not.toBeNull();
  });

  it('should list "My bikes" with the active one marked, switch to another and add a bike for a signed in rider', () => {
    const onSwitchBike = vi.fn();
    const onAddBike = vi.fn();
    render(<Sidebar {...base} garage={garage} onSwitchBike={onSwitchBike} onAddBike={onAddBike} />);
    const section = within(screen.getByTestId('sidebar-garage'));
    expect(section.getByRole('button', { name: new RegExp(`Road bike.*${t.shell.sidebar.activeBike}`) })).toHaveAttribute('aria-current', 'true');
    fireEvent.click(section.getByRole('button', { name: /^Gravel bike/ }));
    fireEvent.click(section.getByRole('button', { name: t.shell.sidebar.addBike }));
    expect(onSwitchBike).toHaveBeenCalledWith('b');
    expect(onAddBike).toHaveBeenCalledTimes(1);
  });

  it('should offer no way to add a bike without the handler, and say so when there is no bike', () => {
    render(<Sidebar {...base} garage={{ bikes: [], activeBikeId: 'current' }} onSwitchBike={vi.fn()} />);
    expect(screen.getByText(t.shell.sidebar.noBikes)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: t.shell.sidebar.addBike })).not.toBeInTheDocument();
  });

  it('should be hidden on a narrow screen until the drawer is opened, and part of the layout from the medium width on', () => {
    const { rerender } = render(<Sidebar {...base} />);
    const aside = () => screen.getByTestId('sidebar');
    expect(aside().className).toMatch(/(?<![:\w-])hidden\b/);
    expect(aside().className).toContain('md:flex');
    expect(screen.queryByTestId('nav-scrim')).not.toBeInTheDocument();
    rerender(<Sidebar {...base} open />);
    expect(aside().className).toMatch(/\bfixed\b/);
    expect(aside().className).not.toMatch(/(?<![:\w-])hidden\b/);
    expect(aside()).toHaveAttribute('data-open', 'true');
    expect(screen.getByTestId('nav-scrim').className).toContain('md:hidden');
  });

  it('should close the drawer from the scrim and after a navigation button, but not from the language and theme switches', () => {
    const onClose = vi.fn();
    render(<Sidebar {...base} open onClose={onClose} />);
    fireEvent.click(screen.getByTestId('nav-scrim'));
    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.click(brand());
    expect(onClose).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getByRole('button', { name: locale === 'en' ? 'CS' : 'EN' }));
    fireEvent.click(screen.getByRole('button', { name: t.navigation.themeDark }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('should set the three modules apart under their own heading, larger than the links, with their full names', () => {
    render(<Sidebar {...base} />);
    expect(nav().getByText(t.shell.sidebar.modules)).toBeInTheDocument();
    const engine = nav().getByRole('button', { name: t.navigation.baikfitEngine });
    expect(engine.className).toContain('text-sm');
    expect(engine.className).toContain('py-3.5');
    expect(nav().getByRole('button', { name: t.navigation.baikfitEngine }).className).not.toContain('text-xs');
    expect(nav().getByRole('button', { name: t.navigation.baikcareStudio }).className).toContain('text-sm');
    const label = nav().getByText(t.navigation.baikshopAdvisory);
    expect(label.className).not.toContain('truncate');
    expect(label.parentElement?.className).toContain('text-sm');
  });
});
