import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import HomePage from '@/app/page';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { fakeAuthClient } from '@/test/fakeAuthClient';
import { translations, type Locale } from '@/lib/i18n/translations';
import { FitHub } from '../FitHub';

describe.each(['en', 'cs'] as Locale[])('the bAIkfit start page (%s)', (locale) => {
  const t = translations[locale];
  const f = t.shell.fitHub;

  it('should show exactly two cards with a badge, a title, one sentence, three steps and one button each', () => {
    render(<FitHub t={t} onTuneBike={vi.fn()} onCheckBike={vi.fn()} />);
    expect(screen.getByRole('heading', { level: 1, name: f.title })).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(2);
    for (const [id, path] of [['fit-path-a', f.pathA], ['fit-path-b', f.pathB]] as const) {
      const tile = within(screen.getByTestId(id));
      expect(tile.getByText(path.badge)).toBeInTheDocument();
      expect(tile.getByRole('heading', { name: path.title })).toBeInTheDocument();
      expect(tile.getByText(path.text)).toBeInTheDocument();
      expect(tile.queryAllByRole('img')).toHaveLength(0);
      for (const icon of Array.from(screen.getByTestId(id).querySelectorAll('svg'))) expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect(tile.getAllByRole('button')).toHaveLength(1);
    }
    expect(within(screen.getByTestId('fit-promises')).getAllByRole('listitem')).toHaveLength(f.chips.length);
  });

  it('should introduce the module by its name, say what it does in one sentence and give three short promises', () => {
    render(<FitHub t={t} onTuneBike={vi.fn()} onCheckBike={vi.fn()} />);
    expect(screen.getByText(t.navigation.baikfitEngine, { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: f.title })).toBeInTheDocument();
    expect(screen.getByText(f.subtitle)).toBeInTheDocument();
    expect(within(screen.getByTestId('fit-promises')).getAllByRole('listitem').map((item) => item.textContent)).toEqual(f.chips);
    expect(f.chips).toHaveLength(3);
    for (const chip of f.chips) expect(chip.length).toBeLessThan(40);
    expect(f.title).not.toMatch(/what do you want|co chcete/i);
  });

  it('should say who each card is for with a tinted label, the first for the rider who has a bike and the second for the one who is buying, on white cards with no solid color fill', () => {
    render(<FitHub t={t} onTuneBike={vi.fn()} onCheckBike={vi.fn()} />);
    const a = screen.getByTestId('fit-path-a');
    const b = screen.getByTestId('fit-path-b');
    expect([a.getAttribute('data-tone'), b.getAttribute('data-tone')]).toEqual(['own', 'buying']);
    expect(within(a).getByText(f.pathA.badge)).toBeInTheDocument();
    expect(within(b).getByText(f.pathB.badge)).toBeInTheDocument();
    expect(f.pathA.badge).not.toBe(f.pathB.badge);
    expect(screen.getByRole('heading', { name: f.choose })).toBeInTheDocument();
    for (const tile of [a, b]) {
      expect(tile.className).toContain('bg-surface');
      expect(tile.className).not.toMatch(/bg-(blue|emerald|green)-|gradient|from-|to-|via-/);
      expect(within(tile).getAllByRole('listitem')).toHaveLength(3);
    }
    expect(within(a).getAllByRole('listitem').map((li) => li.textContent)).toEqual([...f.pathA.points]);
    expect(within(b).getAllByRole('listitem').map((li) => li.textContent)).toEqual([...f.pathB.points]);
  });

  it('should keep the text short: a one sentence description on each tile', () => {
    for (const path of [f.pathA, f.pathB]) {
      expect(path.text.length).toBeLessThan(140);
      expect(path.title.length).toBeLessThan(40);
    }
  });

  it('should lead the first tile to the setup guide and the second to the pre-purchase check', () => {
    const onTuneBike = vi.fn();
    const onCheckBike = vi.fn();
    render(<FitHub t={t} onTuneBike={onTuneBike} onCheckBike={onCheckBike} />);
    fireEvent.click(screen.getByRole('button', { name: f.pathA.button }));
    fireEvent.click(screen.getByRole('button', { name: f.pathB.button }));
    expect(onTuneBike).toHaveBeenCalledTimes(1);
    expect(onCheckBike).toHaveBeenCalledTimes(1);
  });

  it('should use symbols and no pictures or emoji', () => {
    const { container } = render(<FitHub t={t} onTuneBike={vi.fn()} onCheckBike={vi.fn()} />);
    expect(container.querySelectorAll('svg')).toHaveLength(4);
    expect(container.querySelector('img')).toBeNull();
    expect(container.textContent).not.toMatch(/\p{Extended_Pictographic}/u);
  });
});

describe('the bAIkfit start page in the app', () => {
  const t = translations.en;
  const f = t.shell.fitHub;

  it('should be reached from the bAIkfit module of the sidebar, and lead on to both paths', async () => {
    const fake = fakeAuthClient();
    localStorage.clear();
    render(<AuthProvider client={fake.client}><HomePage /></AuthProvider>);
    await act(async () => fake.emit('INITIAL_SESSION', null));
    const nav = () => within(screen.getByRole('navigation', { name: t.shell.sidebar.mainLabel }));
    fireEvent.click(nav().getByRole('button', { name: t.navigation.baikfitEngine }));
    expect(screen.getByTestId('fit-hub')).toBeInTheDocument();
    expect(nav().getByRole('button', { name: t.navigation.baikfitEngine })).toHaveAttribute('aria-current', 'page');
    fireEvent.click(screen.getByRole('button', { name: f.pathA.button }));
    expect(screen.getByText(t.wizard.step1Progress)).toBeInTheDocument();
    fireEvent.click(nav().getByRole('button', { name: t.navigation.baikfitEngine }));
    fireEvent.click(screen.getByRole('button', { name: f.pathB.button }));
    expect(screen.queryByTestId('fit-hub')).not.toBeInTheDocument();
    expect(screen.getByText(t.prePurchaseAudit.step1Title)).toBeInTheDocument();
  });
});
