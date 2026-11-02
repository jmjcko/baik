import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act, waitFor, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { AuthProvider, type AuthClient } from '@/lib/auth/AuthContext';
import { fakeAuthClient, riderSession } from '@/test/fakeAuthClient';
import { toggleAccountMenu } from '@/test/accountMenu';
import { AccountMenu } from '../AccountMenu';

const withAuth = (client: AuthClient | null, ui: React.ReactElement) => render(<AuthProvider client={client}>{ui}</AuthProvider>);

describe.each(['en', 'cs'] as Locale[])('the account menu of the sidebar (%s)', (locale) => {
  const t = translations[locale];
  const props = { t, currentMode: 'entry' as const, onSelectMode: vi.fn(), locale, theme: 'light' as const, onSetLocale: vi.fn(), onSetTheme: vi.fn() };
  const menu = () => within(screen.getByRole('menu', { name: t.shell.sidebar.accountMenu }));

  it('should keep the disabled "sign in soon" item without a database, and offer the capabilities and the settings to the guest', () => {
    const onSelectMode = vi.fn();
    render(<AccountMenu {...props} onSelectMode={onSelectMode} />);
    expect(screen.getByRole('button', { expanded: false })).toHaveTextContent(t.navigation.guestLabel);
    toggleAccountMenu();
    expect(menu().getByRole('menuitem', { name: t.navigation.signInSoon })).toBeDisabled();
    expect(menu().queryByRole('menuitem', { name: t.navigation.myProfile })).toBeNull();
    fireEvent.click(menu().getByRole('menuitem', { name: t.navigation.capabilities }));
    expect(onSelectMode).toHaveBeenCalledWith('capabilities');
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('should change the language and the theme from the menu and keep the menu open', () => {
    const onSetLocale = vi.fn();
    const onSetTheme = vi.fn();
    render(<AccountMenu {...props} onSetLocale={onSetLocale} onSetTheme={onSetTheme} />);
    toggleAccountMenu();
    fireEvent.click(menu().getByRole('button', { name: locale === 'en' ? 'CS' : 'EN' }));
    fireEvent.click(menu().getByRole('button', { name: t.navigation.themeDark }));
    expect(onSetLocale).toHaveBeenCalledWith(locale === 'en' ? 'cs' : 'en');
    expect(onSetTheme).toHaveBeenCalledWith('dark');
    expect(menu().getByRole('button', { name: locale.toUpperCase() })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('should close with Escape and with a click outside of it', () => {
    render(<AccountMenu {...props} />);
    toggleAccountMenu();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).toBeNull();
    toggleAccountMenu();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('should offer the sign in dialog to a guest and show the e-mail with My profile and Sign out when signed in', async () => {
    const fake = fakeAuthClient();
    const onSelectMode = vi.fn();
    withAuth(fake.client, <AccountMenu {...props} onSelectMode={onSelectMode} />);
    act(() => fake.emit('INITIAL_SESSION', null));
    expect(screen.getByTestId('account-menu')).toHaveTextContent(t.shell.sidebar.signInToSave);
    toggleAccountMenu();
    fireEvent.click(menu().getByRole('menuitem', { name: t.auth.signIn }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByText(t.auth.close));
    act(() => fake.emit('SIGNED_IN', riderSession));
    expect(screen.getByTestId('account-menu')).toHaveTextContent('rider@example.com');
    expect(screen.getByTestId('account-menu')).toHaveTextContent(t.shell.sidebar.accountLabel);
    toggleAccountMenu();
    fireEvent.click(menu().getByRole('menuitem', { name: t.navigation.myProfile }));
    expect(onSelectMode).toHaveBeenCalledWith('profile');
    toggleAccountMenu();
    fireEvent.click(menu().getByRole('menuitem', { name: t.auth.signOut }));
    await waitFor(() => expect(fake.auth.signOut).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('should mark the page that is open', () => {
    withAuth(null, <AccountMenu {...props} currentMode="capabilities" />);
    toggleAccountMenu();
    expect(menu().getByRole('menuitem', { name: t.navigation.capabilities })).toHaveAttribute('aria-current', 'page');
  });
});
