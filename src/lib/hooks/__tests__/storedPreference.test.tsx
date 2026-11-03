import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, render, renderHook, screen, fireEvent } from '@testing-library/react';
import HomePage from '@/app/page';
import { translations } from '@/lib/i18n/translations';
import { pickLanguage, pickTheme } from '@/test/accountMenu';
import { LOCALE_KEY, THEME_KEY, useStoredPreference } from '../useStoredPreference';

const COLORS = ['light', 'dark'] as const;

describe('useStoredPreference', () => {
  afterEach(() => vi.restoreAllMocks());

  it('should start with the fallback and report when the browser has taken over', () => {
    const { result } = renderHook(() => useStoredPreference('pref_a', COLORS, 'light'));
    expect(result.current[0]).toBe('light');
    expect(result.current[2]).toBe(true);
  });

  it('should restore the stored value, ignore one that is not allowed and write a new choice to the storage', () => {
    window.localStorage.setItem('pref_b', 'dark');
    const { result } = renderHook(() => useStoredPreference('pref_b', COLORS, 'light'));
    expect(result.current[0]).toBe('dark');
    act(() => result.current[1]('light'));
    expect(result.current[0]).toBe('light');
    expect(window.localStorage.getItem('pref_b')).toBe('light');
    window.localStorage.setItem('pref_c', 'purple');
    expect(renderHook(() => useStoredPreference('pref_c', COLORS, 'light')).result.current[0]).toBe('light');
  });

  it('should keep the choice in memory when the browser refuses to store it or to read it', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    const { result } = renderHook(() => useStoredPreference('pref_d', COLORS, 'light'));
    act(() => result.current[1]('dark'));
    expect(result.current[0]).toBe('dark');
  });
});

describe('the language and the theme of the page', () => {
  it('should be remembered after the page is opened again, and not touch the default for a visitor who never chose', () => {
    const first = render(<HomePage />);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    pickLanguage('CS');
    pickTheme(translations.cs.navigation.themeDark);
    expect(window.localStorage.getItem(LOCALE_KEY)).toBe('cs');
    expect(window.localStorage.getItem(THEME_KEY)).toBe('dark');
    first.unmount();
    render(<HomePage />);
    expect(screen.getByRole('heading', { level: 1, name: translations.cs.shell.dashboard.title })).toBeInTheDocument();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.getAttribute('lang')).toBe('cs');
  });

  it('should open in English and light when nothing was stored', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { level: 1, name: translations.en.shell.dashboard.title })).toBeInTheDocument();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(document.documentElement.getAttribute('lang')).toBe('en');
    fireEvent.click(screen.getByTestId('sidebar'));
  });
});
