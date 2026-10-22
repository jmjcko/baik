import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { AuthProvider, type AuthClient } from '@/lib/auth/AuthContext';
import { fakeAuthClient, riderSession } from '@/test/fakeAuthClient';
import { AuthDialog } from '../AuthDialog';
import { AccountBlock } from '../AccountBlock';
import { SignInOffer, OFFER_DISMISSED_KEY } from '../SignInOffer';
import { AuthRedirectNotice } from '../AuthRedirectNotice';
import { authErrorText } from '../useAuthForm';

const withAuth = (client: AuthClient | null, ui: React.ReactElement) => render(<AuthProvider client={client}>{ui}</AuthProvider>);
const signedOut = () => {
  const fake = fakeAuthClient();
  return fake;
};

describe.each(['en', 'cs'] as Locale[])('AuthDialog (%s)', (locale) => {
  const t = translations[locale];
  const a = t.auth;
  const fill = (email = 'rider@example.com', password = 'correct horse') => {
    fireEvent.change(screen.getByLabelText(new RegExp(a.emailLabel)), { target: { value: email } });
    fireEvent.change(screen.getByLabelText(new RegExp(a.passwordLabel)), { target: { value: password } });
  };

  it('should render nothing while closed and a labelled modal dialog when open', () => {
    const { rerender } = render(<AuthDialog t={t} open={false} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    rerender(<AuthDialog t={t} open onClose={vi.fn()} />);
    expect(screen.getByRole('dialog', { name: a.title })).toHaveAttribute('aria-modal', 'true');
  });

  it('should close with Escape, the close button and a click on the backdrop', () => {
    const onClose = vi.fn();
    render(<AuthDialog t={t} open onClose={onClose} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    fireEvent.click(screen.getByText(a.close));
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it('should sign in with the password without the consent and close the dialog', async () => {
    const fake = signedOut();
    const onClose = vi.fn();
    withAuth(fake.client, <AuthDialog t={t} open onClose={onClose} />);
    fill();
    fireEvent.click(screen.getByRole('button', { name: a.submitSignIn }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(fake.auth.signInWithPassword).toHaveBeenCalledWith({ email: 'rider@example.com', password: 'correct horse' });
  });

  it('should ask for the consent before it creates an account, then register and tell the rider to check the e-mail', async () => {
    const fake = signedOut();
    withAuth(fake.client, <AuthDialog t={t} open onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('tab', { name: a.tabSignUp }));
    fill();
    fireEvent.click(screen.getByRole('button', { name: a.submitSignUp }));
    expect(screen.getByRole('alert')).toHaveTextContent(a.errors.consent);
    expect(fake.auth.signUp).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: a.submitSignUp }));
    expect(await screen.findByRole('status')).toHaveTextContent(a.noticeCheckEmail);
    expect(fake.auth.signUp).toHaveBeenCalledTimes(1);
  });

  it('should send the sign in link and start Google only after the consent', async () => {
    const fake = signedOut();
    withAuth(fake.client, <AuthDialog t={t} open onClose={vi.fn()} />);
    fill();
    fireEvent.click(screen.getByRole('button', { name: a.magicLink }));
    fireEvent.click(screen.getByRole('button', { name: a.google }));
    expect(fake.auth.signInWithOtp).not.toHaveBeenCalled();
    expect(fake.auth.signInWithOAuth).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: a.magicLink }));
    await waitFor(() => expect(fake.auth.signInWithOtp).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole('button', { name: a.google }));
    await waitFor(() => expect(fake.auth.signInWithOAuth).toHaveBeenCalledTimes(1));
  });

  it('should show one text for wrong credentials and an unconfirmed e-mail and never the message of the service', async () => {
    const fake = signedOut();
    fake.auth.signInWithPassword.mockResolvedValueOnce({ data: {}, error: { code: 'invalid_credentials', status: 400, message: 'Invalid login credentials' } } as never);
    withAuth(fake.client, <AuthDialog t={t} open onClose={vi.fn()} />);
    fill();
    fireEvent.click(screen.getByRole('button', { name: a.submitSignIn }));
    expect(await screen.findByRole('alert')).toHaveTextContent(a.errors.credentials);
    expect(screen.getByRole('alert')).not.toHaveTextContent('Invalid login credentials');
    expect(authErrorText(a.errors, 'email_not_confirmed')).toBe(authErrorText(a.errors, 'invalid_credentials'));
  });

  it('should explain a too short password without a request', async () => {
    const fake = signedOut();
    withAuth(fake.client, <AuthDialog t={t} open onClose={vi.fn()} />);
    fill('rider@example.com', 'short');
    fireEvent.click(screen.getByRole('button', { name: a.submitSignIn }));
    expect(await screen.findByRole('alert')).toHaveTextContent(a.errors.invalidInput);
    expect(fake.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it('should use the right autocomplete for each mode and keep the password field a password field', () => {
    render(<AuthDialog t={t} open onClose={vi.fn()} />);
    const password = screen.getByLabelText(new RegExp(a.passwordLabel));
    expect(password).toHaveAttribute('type', 'password');
    expect(password).toHaveAttribute('autocomplete', 'current-password');
    fireEvent.click(screen.getByRole('tab', { name: a.tabSignUp }));
    expect(password).toHaveAttribute('autocomplete', 'new-password');
  });

  it('should start empty every time it is opened: nothing typed, not even the password, survives a close', () => {
    const { rerender } = render(<AuthDialog t={t} open onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('tab', { name: a.tabSignUp }));
    fill('rider@example.com', 'correct horse');
    fireEvent.click(screen.getByRole('checkbox'));
    rerender(<AuthDialog t={t} open={false} onClose={vi.fn()} />);
    rerender(<AuthDialog t={t} open onClose={vi.fn()} />);
    expect(screen.getByLabelText(new RegExp(a.emailLabel))).toHaveValue('');
    expect(screen.getByLabelText(new RegExp(a.passwordLabel))).toHaveValue('');
    expect(screen.getByRole('checkbox')).not.toBeChecked();
    expect(screen.getByRole('tab', { name: a.tabSignIn })).toHaveAttribute('aria-selected', 'true');
  });

  it('should have a text for every error code', () => {
    for (const code of ['invalid_credentials', 'email_not_confirmed', 'consent', 'weak_password', 'rate_limited', 'network', 'not_configured', 'invalid_input', 'unknown'] as const) {
      expect(authErrorText(a.errors, code).length, code).toBeGreaterThan(10);
    }
  });
});

describe.each(['en', 'cs'] as Locale[])('AccountBlock (%s)', (locale) => {
  const t = translations[locale];

  it('should keep the disabled "sign in soon" button without Supabase', () => {
    render(<AccountBlock t={t} />);
    expect(screen.getByRole('button', { name: t.navigation.signInSoon })).toBeDisabled();
    expect(screen.getByText(t.navigation.guestLabel)).toBeInTheDocument();
  });

  it('should offer the sign in dialog to a guest and show the account with a sign out button when signed in', async () => {
    const fake = signedOut();
    withAuth(fake.client, <AccountBlock t={t} />);
    expect(screen.getByRole('button', { name: t.navigation.signInSoon })).toBeDisabled();
    act(() => fake.emit('INITIAL_SESSION', null));
    fireEvent.click(screen.getByRole('button', { name: t.auth.signIn }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByText(t.auth.close));
    act(() => fake.emit('SIGNED_IN', riderSession));
    expect(screen.getByText('rider@example.com')).toBeInTheDocument();
    expect(screen.getByText(t.auth.signedIn)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: t.auth.signOut }));
    await waitFor(() => expect(fake.auth.signOut).toHaveBeenCalledTimes(1));
  });
});

describe.each(['en', 'cs'] as Locale[])('SignInOffer (%s)', (locale) => {
  const t = translations[locale];

  beforeEach(() => window.sessionStorage.clear());
  afterEach(() => window.sessionStorage.clear());

  it('should not be shown without Supabase or while the session is loading or for a signed in rider', () => {
    const { unmount } = render(<SignInOffer t={t} variant="report" />);
    expect(screen.queryByTestId('sign-in-offer')).not.toBeInTheDocument();
    unmount();
    const fake = signedOut();
    withAuth(fake.client, <SignInOffer t={t} variant="report" />);
    expect(screen.queryByTestId('sign-in-offer')).not.toBeInTheDocument();
    act(() => fake.emit('SIGNED_IN', riderSession));
    expect(screen.queryByTestId('sign-in-offer')).not.toBeInTheDocument();
  });

  it('should offer the sign in to a guest with the text of its place and open the dialog', () => {
    const fake = signedOut();
    const { unmount } = withAuth(fake.client, <SignInOffer t={t} variant="report" />);
    act(() => fake.emit('INITIAL_SESSION', null));
    expect(screen.getByText(t.auth.offer.reportBody)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: t.auth.offer.signIn }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    unmount();
    const other = signedOut();
    withAuth(other.client, <SignInOffer t={t} variant="pathB" />);
    act(() => other.emit('INITIAL_SESSION', null));
    expect(screen.getByText(t.auth.offer.pathBBody)).toBeInTheDocument();
  });

  it('should go away with "not now" and stay away for the rest of the session without blocking anything', () => {
    const fake = signedOut();
    const { unmount } = withAuth(fake.client, <SignInOffer t={t} variant="report" />);
    act(() => fake.emit('INITIAL_SESSION', null));
    fireEvent.click(screen.getByRole('button', { name: t.auth.offer.notNow }));
    expect(screen.queryByTestId('sign-in-offer')).not.toBeInTheDocument();
    expect(window.sessionStorage.getItem(OFFER_DISMISSED_KEY)).toBe('1');
    unmount();
    const again = signedOut();
    withAuth(again.client, <SignInOffer t={t} variant="report" />);
    act(() => again.emit('INITIAL_SESSION', null));
    expect(screen.queryByTestId('sign-in-offer')).not.toBeInTheDocument();
  });
});

describe.each(['en', 'cs'] as Locale[])('AuthRedirectNotice (%s)', (locale) => {
  const t = translations[locale];

  afterEach(() => window.history.replaceState(null, '', '/'));

  it.each([['ok', t.auth.redirect.ok, 'status'], ['error', t.auth.redirect.error, 'alert']] as const)('should tell the rider about ?auth=%s once and clean the address', (flag, text, role) => {
    window.history.replaceState(null, '', `/?auth=${flag}&keep=1#x`);
    render(<AuthRedirectNotice t={t} />);
    expect(screen.getByRole(role)).toHaveTextContent(text);
    expect(window.location.search).toBe('?keep=1');
    expect(window.location.hash).toBe('#x');
    fireEvent.click(screen.getByText(t.auth.redirect.dismiss));
    expect(screen.queryByRole(role)).not.toBeInTheDocument();
  });

  it('should show nothing without the flag or with an unknown value', () => {
    window.history.replaceState(null, '', '/?auth=evil');
    render(<AuthRedirectNotice t={t} />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
