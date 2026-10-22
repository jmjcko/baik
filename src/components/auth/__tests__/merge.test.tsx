import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { DEFAULT_PROFILE, deriveCoordinates } from '@/lib/profile/values';
import { profileToPassport } from '@/lib/passport/mappers';
import { AuthProvider } from '@/lib/auth/AuthContext';
import HomePage from '@/app/page';
import { fakeAuthClient, riderSession } from '@/test/fakeAuthClient';
import { saveLocalPassport } from '@/lib/passport/localStore';
import { passportToRow } from '@/lib/passport/mappers';
import { MergeDialog } from '../MergeDialog';
import { SyncNotice } from '../SyncNotice';

const passportFor = (overrides = {}) => {
  const values = { ...DEFAULT_PROFILE, ...overrides };
  return profileToPassport(values, deriveCoordinates(values));
};

describe.each(['en', 'cs'] as Locale[])('MergeDialog (%s)', (locale) => {
  const t = translations[locale];
  const prompt = { device: passportFor({ inseamMm: 860, discipline: 'gravel' as const }), account: passportFor({ inseamMm: 870 }) };

  it('should render nothing without a question', () => {
    render(<MergeDialog t={t} prompt={null} onResolve={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should compare the account and the device and offer the two choices, the account first and focused', () => {
    const onResolve = vi.fn();
    render(<MergeDialog t={t} prompt={prompt} onResolve={onResolve} />);
    expect(screen.getByRole('dialog', { name: t.auth.merge.title })).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText(t.auth.merge.accountTitle)).toBeInTheDocument();
    expect(screen.getByText(t.auth.merge.deviceTitle)).toBeInTheDocument();
    expect(screen.getByText('860 mm')).toBeInTheDocument();
    expect(screen.getByText('870 mm')).toBeInTheDocument();
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveTextContent(t.auth.merge.keepAccount);
    expect(buttons[0]).toHaveFocus();
    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[1]);
    expect(onResolve.mock.calls).toEqual([['account'], ['device']]);
  });

  it('should not close with Escape or a click outside: a choice is needed', () => {
    const onResolve = vi.fn();
    render(<MergeDialog t={t} prompt={prompt} onResolve={onResolve} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    fireEvent.click(screen.getByRole('dialog'));
    expect(onResolve).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});

describe.each(['en', 'cs'] as Locale[])('SyncNotice (%s)', (locale) => {
  const t = translations[locale];

  it('should show an alert only for an error, and let the rider dismiss it until the next error', () => {
    const { rerender } = render(<SyncNotice t={t} sync="idle" />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    rerender(<SyncNotice t={t} sync="error" />);
    expect(screen.getByRole('alert')).toHaveTextContent(t.auth.syncError);
    fireEvent.click(screen.getByText(t.auth.redirect.dismiss));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    rerender(<SyncNotice t={t} sync="idle" />);
    rerender(<SyncNotice t={t} sync="error" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});

describe('the app asks which data to keep at the first sign in', () => {
  it('should show the dialog in the page and continue with the account data after the choice', async () => {
    localStorage.clear();
    saveLocalPassport(passportFor({ inseamMm: 860 }));
    const fake = fakeAuthClient();
    fake.database.rows.set('u1', passportToRow('u1', passportFor({ inseamMm: 870 })) as unknown as Record<string, unknown>);
    render(
      <AuthProvider client={fake.client}>
        <HomePage />
      </AuthProvider>
    );
    await act(async () => fake.emit('INITIAL_SESSION', null));
    await act(async () => fake.emit('SIGNED_IN', riderSession));
    const t = translations.en;
    expect(screen.getByRole('dialog', { name: t.auth.merge.title })).toBeInTheDocument();
    await act(async () => fireEvent.click(screen.getByText(t.auth.merge.keepAccount)));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('870 mm')).toBeInTheDocument();
    expect(screen.getByTestId('account-block')).toHaveTextContent('rider@example.com');
  });
});
