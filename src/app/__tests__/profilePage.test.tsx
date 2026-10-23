import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import type { Session } from '@supabase/supabase-js';
import HomePage from '../page';
import { translations } from '@/lib/i18n/translations';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { DEFAULT_PROFILE, deriveCoordinates } from '@/lib/profile/values';
import { passportToRow, profileToPassport } from '@/lib/passport/mappers';
import { fakeAuthClient } from '@/test/fakeAuthClient';
import { formatDay } from '@/components/profile/format';
import { todayOf } from '@/components/report/stock/useRecordDiagnosis';

const t = translations.en;
/** The page itself: the sidebar repeats the e-mail and the inseam. */
const page = () => within(screen.getByRole('main'));
const session = { user: { id: 'u1', email: 'rider@example.com', created_at: '2026-09-30T12:00:00Z', app_metadata: { provider: 'google' } } } as unknown as Session;

const stored = (inseamMm = 870) => {
  const values = { ...DEFAULT_PROFILE, inseamMm, currentPains: ['numb_hands' as const] };
  return { ...passportToRow('u1', profileToPassport(values, deriveCoordinates(values))), created_at: '2026-10-01T08:00:00Z', updated_at: '2026-10-22T09:30:00Z' } as unknown as Record<string, unknown>;
};

function setup(withAccount = true) {
  const fake = fakeAuthClient();
  if (withAccount) fake.database.rows.set('u1', stored());
  render(<AuthProvider client={fake.client}><HomePage /></AuthProvider>);
  const signIn = async () => {
    await act(async () => fake.emit('INITIAL_SESSION', null));
    await act(async () => fake.emit('SIGNED_IN', session));
  };
  const openProfile = async () => {
    await signIn();
    fireEvent.click(await screen.findByRole('button', { name: t.navigation.myProfile }));
    await screen.findByRole('heading', { level: 1, name: t.profile.title });
  };
  return { fake, signIn, openProfile };
}

describe('My profile in the app', () => {
  beforeEach(() => localStorage.clear());

  it('should offer My profile only to a signed in rider', async () => {
    const { signIn, fake } = setup();
    await act(async () => fake.emit('INITIAL_SESSION', null));
    expect(screen.queryByRole('button', { name: t.navigation.myProfile })).not.toBeInTheDocument();
    await signIn();
    expect(await screen.findByRole('button', { name: t.navigation.myProfile })).toBeInTheDocument();
  });

  it('should show the stored profile of the account: values, symptoms, last save and the calculated targets', async () => {
    const { openProfile } = setup();
    await openProfile();
    expect(page().getByText('rider@example.com')).toBeInTheDocument();
    expect(await screen.findByText(t.profile.account.lastSaved)).toBeInTheDocument();
    expect(page().getByText('870 mm')).toBeInTheDocument();
    expect(screen.getByText(t.studio.pains.numb_hands)).toBeInTheDocument();
    expect(screen.getByTestId('target-saddle')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: t.navigation.myProfile })).toHaveAttribute('aria-current', 'page');
  });

  it('should open the matching wizard step from Change and come back to the profile from the back button', async () => {
    const { openProfile } = setup();
    await openProfile();
    fireEvent.click(screen.getByRole('button', { name: `${t.profile.entered.change}: ${t.profile.entered.groups.body}` }));
    expect(screen.getByText(t.wizard.step2Progress)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: t.profile.backToProfile }));
    expect(screen.getByRole('heading', { level: 1, name: t.profile.title })).toBeInTheDocument();
  });

  it('should return to the profile, not the report, when the wizard is finished or left from there', async () => {
    const { openProfile } = setup();
    await openProfile();
    fireEvent.click(screen.getByRole('button', { name: `${t.profile.entered.change}: ${t.profile.entered.groups.bike}` }));
    fireEvent.click(screen.getByRole('button', { name: t.wizard.toReportButton }));
    expect(screen.getByRole('heading', { level: 1, name: t.profile.title })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: `${t.profile.entered.change}: ${t.profile.entered.groups.discipline}` }));
    fireEvent.click(screen.getByRole('button', { name: t.wizard.backButton }));
    expect(screen.getByRole('heading', { level: 1, name: t.profile.title })).toBeInTheDocument();
  });

  it('should show the garage with the active bike, add a bike and open its setup at step 4, then switch back with the numbers of the first bike', async () => {
    const { openProfile } = setup();
    await openProfile();
    const g = t.profile.garage;
    expect(await screen.findByRole('heading', { level: 2, name: g.title })).toBeInTheDocument();
    expect(screen.getAllByText(g.active)).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: g.add }));
    fireEvent.change(screen.getByLabelText(g.nameLabel), { target: { value: 'Gravel bike' } });
    fireEvent.click(screen.getByRole('button', { name: g.create }));
    expect(screen.getByText(t.wizard.step4Progress)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: t.navigation.myProfile }));
    expect(await screen.findByRole('heading', { name: 'Gravel bike' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: `${g.makeActive}: ${g.unnamed}` }));
    expect(screen.getAllByText(g.active)).toHaveLength(1);
    expect(within(screen.getAllByTestId('garage-bike')[0]).getByRole('heading', { name: g.unnamed })).toBeInTheDocument();
  });

  it('should rename a bike and delete one after switching away from it, but never the active or the only bike', async () => {
    const { openProfile } = setup();
    await openProfile();
    const g = t.profile.garage;
    expect(await screen.findByText(g.removeOnlyHint)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: `${g.rename}: ${g.unnamed}` }));
    fireEvent.change(screen.getByLabelText(`${g.nameLabel}: ${g.unnamed}`), { target: { value: 'My summer road bike' } });
    fireEvent.click(screen.getByRole('button', { name: g.save }));
    expect(screen.getByRole('heading', { name: 'My summer road bike' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: g.add }));
    fireEvent.change(screen.getByLabelText(g.nameLabel), { target: { value: 'Gravel bike' } });
    fireEvent.click(screen.getByRole('button', { name: g.create }));
    fireEvent.click(screen.getByRole('button', { name: t.navigation.myProfile }));
    expect(await screen.findByText(g.removeActiveHint)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: `${g.remove}: My summer road bike` }));
    fireEvent.click(screen.getByRole('button', { name: g.confirmRemove }));
    expect(screen.queryByRole('heading', { name: 'My summer road bike' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Gravel bike' })).toBeInTheDocument();
    expect(screen.getByText(g.removeOnlyHint)).toBeInTheDocument();
  });

  it('should start a bike audit from a card: the setup guide opens at the current bike step and leads on to the report', async () => {
    const { openProfile } = setup();
    await openProfile();
    fireEvent.click(await screen.findByRole('button', { name: `${t.profile.garage.audit}: ${t.profile.garage.unnamed}` }));
    expect(screen.getByText(t.wizard.step4Progress)).toBeInTheDocument();
    expect(screen.getByTestId('stock-picker')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: t.wizard.toReportButton }));
    expect(await screen.findByRole('heading', { name: t.diagnosticReport.title })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: t.navigation.myProfile }));
    expect(await screen.findByText(formatDay(todayOf(), 'en'))).toBeInTheDocument();
  });

  it('should not offer the way back to the profile in a wizard that was opened from the entry view', async () => {
    const { signIn } = setup();
    await signIn();
    fireEvent.click(screen.getByText(t.entryRouter.pathAButton));
    expect(screen.queryByRole('button', { name: t.profile.backToProfile })).not.toBeInTheDocument();
  });

  it('should not send a signed out rider back to the profile from a wizard that was opened there', async () => {
    const { fake, openProfile } = setup();
    await openProfile();
    fireEvent.click(screen.getByRole('button', { name: `${t.profile.entered.change}: ${t.profile.entered.groups.bike}` }));
    await act(async () => fake.emit('SIGNED_OUT', null));
    expect(screen.queryByRole('button', { name: t.profile.backToProfile })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: t.wizard.toReportButton }));
    expect(screen.queryByRole('heading', { level: 1, name: t.profile.title })).not.toBeInTheDocument();
  });

  it('should delete the stored data: the row is gone, the values are the defaults and the page says nothing is stored', async () => {
    const { fake, openProfile } = setup();
    await openProfile();
    await page().findByText('870 mm');
    fireEvent.click(screen.getByRole('button', { name: t.profile.rights.erase.button }));
    fireEvent.click(screen.getByRole('button', { name: t.profile.rights.erase.confirm }));
    expect(await screen.findByText(t.profile.rights.erase.done)).toBeInTheDocument();
    expect(fake.database.rows.has('u1')).toBe(false);
    expect(page().getByText(`${DEFAULT_PROFILE.inseamMm} mm`)).toBeInTheDocument();
    expect(await screen.findByText(t.profile.account.neverSaved)).toBeInTheDocument();
  });

  it('should delete the account and the signed out rider lands on the entry view', async () => {
    const { fake, openProfile } = setup();
    await openProfile();
    fireEvent.click(screen.getByRole('button', { name: t.profile.rights.deleteAccount.button }));
    fireEvent.click(screen.getByRole('button', { name: t.profile.rights.deleteAccount.confirm }));
    await waitFor(() => expect(fake.auth.signOut).toHaveBeenCalledTimes(1));
    expect(fake.database.rpc).toHaveBeenCalledWith('delete_my_account');
    await act(async () => fake.emit('SIGNED_OUT', null));
    expect(await screen.findByText(t.entryRouter.title)).toBeInTheDocument();
  });

  it('should keep the rider signed in and show an error when the account cannot be deleted', async () => {
    const { fake, openProfile } = setup();
    fake.database.rpcResults.delete_my_account = { error: { code: '500' } };
    await openProfile();
    fireEvent.click(screen.getByRole('button', { name: t.profile.rights.deleteAccount.button }));
    fireEvent.click(screen.getByRole('button', { name: t.profile.rights.deleteAccount.confirm }));
    expect(await screen.findByText(t.profile.rights.deleteAccount.error)).toBeInTheDocument();
    expect(fake.auth.signOut).not.toHaveBeenCalled();
  });

  it('should leave the profile for the entry view when the rider signs out from the sidebar', async () => {
    const { fake, openProfile } = setup();
    await openProfile();
    await act(async () => fake.emit('SIGNED_OUT', null));
    expect(await screen.findByText(t.entryRouter.title)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: t.navigation.myProfile })).not.toBeInTheDocument();
  });

  it('should show the catalog admin link only to an admin, and open the page from it', async () => {
    const { fake, signIn } = setup();
    fake.database.rpcResults.is_admin = { data: true };
    await signIn();
    fireEvent.click(await screen.findByRole('button', { name: t.admin.navLabel }));
    expect(await screen.findByRole('heading', { level: 1, name: t.admin.title })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: t.admin.navLabel })).toHaveAttribute('aria-current', 'page');
    expect(await screen.findByTestId('queue-empty')).toBeInTheDocument();
  });

  it('should not show the catalog admin link to a rider who is not an admin, or to a guest', async () => {
    const { fake, signIn } = setup();
    await act(async () => fake.emit('INITIAL_SESSION', null));
    expect(screen.queryByRole('button', { name: t.admin.navLabel })).not.toBeInTheDocument();
    await signIn();
    await screen.findByRole('button', { name: t.navigation.myProfile });
    expect(screen.queryByRole('button', { name: t.admin.navLabel })).not.toBeInTheDocument();
  });

  it('should show the profile in Czech after the language switch', async () => {
    const { openProfile } = setup();
    await openProfile();
    fireEvent.click(screen.getByRole('button', { name: 'CS' }));
    expect(await screen.findByRole('heading', { level: 1, name: translations.cs.profile.title })).toBeInTheDocument();
  });
});
