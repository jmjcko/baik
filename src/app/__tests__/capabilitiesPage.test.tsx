import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act, within } from '@testing-library/react';
import HomePage from '../page';
import { translations, type Locale } from '@/lib/i18n/translations';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { fakeAuthClient } from '@/test/fakeAuthClient';
import { storedPassport } from '@/test/storedPassport';

const t = translations.en;

async function setup() {
  const fake = fakeAuthClient();
  render(<AuthProvider client={fake.client}><HomePage /></AuthProvider>);
  await act(async () => fake.emit('INITIAL_SESSION', null));
}

describe('Fitting capabilities in the app', () => {
  beforeEach(() => localStorage.clear());

  it('should be open to a guest from the sidebar, mark itself as the current page and show the 20 parameters', async () => {
    await setup();
    fireEvent.click(screen.getByRole('button', { name: t.navigation.capabilities }));
    expect(screen.getByRole('heading', { level: 1, name: t.capabilities.title })).toBeInTheDocument();
    expect(screen.getAllByTestId('capability')).toHaveLength(20);
    expect(screen.getByRole('button', { name: t.navigation.capabilities })).toHaveAttribute('aria-current', 'page');
  });

  it('should lead from the mini-tests parameter to wizard step 3, where an answer is kept in the passport', async () => {
    await setup();
    fireEvent.click(screen.getByRole('button', { name: t.navigation.capabilities }));
    fireEvent.click(screen.getByRole('button', { name: t.capabilities.takeTests }));
    expect(screen.getByText(t.wizard.step3Progress)).toBeInTheDocument();
    const hamstring = within(screen.getByTestId('hamstring-test'));
    fireEvent.click(hamstring.getByRole('radio', { name: new RegExp(t.miniTests.hamstring.options.low.title) }));
    expect(storedPassport()?.mobility).toEqual({ hamstring: 'low' });
    fireEvent.click(within(screen.getByTestId('release-test')).getByRole('radio', { name: new RegExp(t.miniTests.release.options.slumping.title) }));
    expect(storedPassport()?.mobility).toEqual({ hamstring: 'low', release: 'slumping' });
  });

  it('should be shown in Czech when the language is switched', async () => {
    await setup();
    fireEvent.click(screen.getByRole('button', { name: 'CS' }));
    const cs = translations['cs' as Locale];
    fireEvent.click(screen.getByRole('button', { name: cs.navigation.capabilities }));
    expect(screen.getByRole('heading', { level: 1, name: cs.capabilities.title })).toBeInTheDocument();
    expect(screen.getAllByTestId('capability')).toHaveLength(20);
  });
});
