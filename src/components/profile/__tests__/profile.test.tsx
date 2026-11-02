import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { KB_VERSION } from '@/lib/engines/baikfit/kbRules';
import { DEFAULT_PROFILE, deriveCoordinates, type ProfileValues } from '@/lib/profile/values';
import { profileToPassport } from '@/lib/passport/mappers';
import type { StoredRecordState } from '@/lib/hooks/useStoredRecord';
import { formatStamp, signInMethod } from '../format';
import { ProfileView, type ProfileViewProps } from '../ProfileView';

const values: ProfileValues = { ...DEFAULT_PROFILE, inseamMm: 850, currentPains: ['numb_hands', 'front_knee'], currentSaddleHeightMm: 700 };
const base = profileToPassport(values, deriveCoordinates(values));
const passport = { ...base, riders: [{ ...base.riders[0], anatomy: { ...base.riders[0].anatomy, footLengthMm: 265, waistCircumferenceCm: 84 } }] };
const ready = (): StoredRecordState => ({ status: 'ready', record: { passport, createdAt: '2026-10-01T08:00:00Z', updatedAt: '2026-10-22T09:30:00Z' } });

function setup(locale: Locale, overrides: Partial<ProfileViewProps> = {}, tab: 'riders' | 'numbers' | 'account' = 'account') {
  const props: ProfileViewProps = {
    t: translations[locale],
    locale,
    values,
    coordinates: deriveCoordinates(values),
    stored: ready(),
    account: { email: 'rider@example.com', createdAt: '2026-09-30T12:00:00Z', method: 'google' },
    onChange: vi.fn(),
    onErase: vi.fn(async () => true),
    onDeleteAccount: vi.fn(async () => true),
    onSignOut: vi.fn(),
    onOpenReport: vi.fn(),
    settings: { theme: 'light', onSetLocale: vi.fn(), onSetTheme: vi.fn() },
    ...overrides,
  };
  render(<ProfileView {...props} />);
  if (tab !== 'riders') fireEvent.click(screen.getByRole('tab', { name: translations[locale].profile.tabs[tab] }));
  return props;
}

describe.each(['en', 'cs'] as Locale[])('ProfileView (%s)', (locale) => {
  const p = translations[locale].profile;

  afterEach(() => vi.restoreAllMocks());

  it('should show the title and the three tabs, each with its own block', () => {
    const tabs = p.tabs;
    setup(locale, {}, 'riders');
    expect(screen.getByRole('heading', { level: 1, name: p.title })).toBeInTheDocument();
    expect(screen.getByRole('tablist', { name: tabs.label })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: tabs.riders })).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(screen.getByRole('tab', { name: tabs.numbers }));
    expect(screen.getByRole('heading', { level: 2, name: p.calculated.title })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2, name: p.account.title })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: tabs.account }));
    for (const name of [p.account.title, p.rights.title]) expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', 'profile-tab-account');
  });

  it('should show who is signed in, how, since when, and when the profile was saved', () => {
    setup(locale);
    expect(screen.getByText('rider@example.com')).toBeInTheDocument();
    expect(screen.getByText(p.account.methods.google)).toBeInTheDocument();
    expect(screen.getByText(p.account.lastSaved)).toBeInTheDocument();
    expect(screen.getAllByText(/2026/).length).toBeGreaterThanOrEqual(2);
  });

  it.each([
    ['loading', { status: 'loading' } as const, 'status', p.account.loading],
    ['an unreadable row', { status: 'error' } as const, 'alert', p.account.readError],
  ])('should say so while %s', (_name, stored, role, text) => {
    setup(locale, { stored });
    expect(screen.getByRole(role)).toHaveTextContent(text);
  });

  it('should say that nothing is saved yet and offer no download', () => {
    setup(locale, { stored: { status: 'ready', record: null } });
    expect(screen.getByText(p.account.neverSaved)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: p.rights.export.button })).toBeDisabled();
    expect(screen.getByText(p.rights.export.empty)).toBeInTheDocument();
  });

  it('should show the four calculated numbers with the knowledge base version, say they are not editable and lead to the report for the explanations', () => {
    const props = setup(locale, {}, 'numbers');
    for (const key of ['saddle', 'handlebar', 'crank', 'setback']) expect(screen.getByTestId(`target-${key}`)).toBeInTheDocument();
    expect(screen.getByTestId('kb-version')).toHaveTextContent(KB_VERSION);
    expect(screen.getByText(new RegExp(p.calculated.locked.slice(0, 20)))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(p.numbers.stack))).toBeInTheDocument();
    expect(document.querySelector('[aria-expanded]')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: p.numbers.openReport }));
    expect(props.onOpenReport).toHaveBeenCalledTimes(1);
  });

  it('should sign out from the account block and change the language and the theme from the settings', () => {
    const props = setup(locale);
    fireEvent.click(screen.getByRole('button', { name: translations[locale].auth.signOut }));
    expect(props.onSignOut).toHaveBeenCalledTimes(1);
    const n = translations[locale].navigation;
    fireEvent.click(within(screen.getByRole('group', { name: n.languageLabel })).getByRole('button', { name: locale === 'en' ? 'CS' : 'EN' }));
    fireEvent.click(within(screen.getByRole('group', { name: n.themeLabel })).getByRole('button', { name: n.themeDark }));
    expect(props.settings.onSetLocale).toHaveBeenCalledWith(locale === 'en' ? 'cs' : 'en');
    expect(props.settings.onSetTheme).toHaveBeenCalledWith('dark');
    expect(screen.getByRole('heading', { level: 3, name: p.settings.title })).toBeInTheDocument();
  });

  it('should download the stored data as a file', () => {
    const create = vi.fn(() => 'blob:x');
    Object.assign(URL, { createObjectURL: create, revokeObjectURL: vi.fn() });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    setup(locale);
    fireEvent.click(screen.getByRole('button', { name: p.rights.export.button }));
    expect(click).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('should put the bikes that the rider shared into the downloaded file', async () => {
    const create = vi.fn<(blob: Blob) => string>(() => 'blob:x');
    Object.assign(URL, { createObjectURL: create, revokeObjectURL: vi.fn() });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    const shared = [{ id: 's1', userId: 'u1', brand: 'Cube', model: 'Attain', year: 2024, size: '54', key: 'k', spec: passport.riders[0].anatomy as never, status: 'approved' as const, catalogId: 'c1', reviewNote: null, createdAt: '2026-10-23T10:00:00Z' }];
    const loadShared = vi.fn(async () => shared);
    setup(locale, { loadShared });
    fireEvent.click(screen.getByRole('button', { name: p.rights.export.button }));
    await waitFor(() => expect(create).toHaveBeenCalled());
    const exported = JSON.parse(await (create.mock.calls[0][0] as Blob).text());
    expect(exported.sharedBikes).toEqual([expect.objectContaining({ brand: 'Cube', status: 'approved', size: '54' })]);
    expect(loadShared).toHaveBeenCalledTimes(1);
  });

  it('should tell the rider when the file cannot be created', () => {
    Object.assign(URL, { createObjectURL: () => { throw new Error('no'); }, revokeObjectURL: vi.fn() });
    setup(locale);
    fireEvent.click(screen.getByRole('button', { name: p.rights.export.button }));
    expect(screen.getByRole('alert')).toHaveTextContent(p.rights.export.error);
  });

  it('should not export the method of sign in, only the account facts', async () => {
    const create = vi.fn<(blob: Blob) => string>(() => 'blob:x');
    Object.assign(URL, { createObjectURL: create, revokeObjectURL: vi.fn() });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    setup(locale);
    fireEvent.click(screen.getByRole('button', { name: p.rights.export.button }));
    const exported = JSON.parse(await (create.mock.calls[0][0] as Blob).text());
    expect(exported.account).toEqual({ email: 'rider@example.com', createdAt: '2026-09-30T12:00:00Z' });
  });
});

describe.each(['en', 'cs'] as Locale[])('destructive actions (%s)', (locale) => {
  const r = translations[locale].profile.rights;

  it('should run nothing until the second click, and nothing at all when cancelled', () => {
    const props = setup(locale);
    fireEvent.click(screen.getByRole('button', { name: r.erase.button }));
    expect(screen.getByRole('group', { name: r.erase.confirmTitle })).toBeInTheDocument();
    expect(props.onErase).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: r.erase.cancel }));
    expect(screen.queryByRole('group', { name: r.erase.confirmTitle })).not.toBeInTheDocument();
    expect(props.onErase).not.toHaveBeenCalled();
  });

  it('should delete the stored data after the confirmation and say it is done', async () => {
    const props = setup(locale);
    fireEvent.click(screen.getByRole('button', { name: r.erase.button }));
    fireEvent.click(screen.getByRole('button', { name: r.erase.confirm }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(r.erase.done));
    expect(props.onErase).toHaveBeenCalledTimes(1);
    expect(props.onDeleteAccount).not.toHaveBeenCalled();
  });

  it('should show a fixed error and keep the confirmation open when the delete fails', async () => {
    setup(locale, { onErase: vi.fn(async () => false) });
    fireEvent.click(screen.getByRole('button', { name: r.erase.button }));
    fireEvent.click(screen.getByRole('button', { name: r.erase.confirm }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(r.erase.error));
    expect(screen.getByRole('group', { name: r.erase.confirmTitle })).toBeInTheDocument();
  });

  it('should disable both buttons while the request runs', async () => {
    let finish: (ok: boolean) => void = () => undefined;
    setup(locale, { onErase: () => new Promise<boolean>((resolve) => { finish = resolve; }) });
    fireEvent.click(screen.getByRole('button', { name: r.erase.button }));
    fireEvent.click(screen.getByRole('button', { name: r.erase.confirm }));
    const group = screen.getByRole('group', { name: r.erase.confirmTitle });
    expect(within(group).getByRole('button', { name: r.erase.working })).toBeDisabled();
    expect(within(group).getByRole('button', { name: r.erase.cancel })).toBeDisabled();
    finish(true);
    await waitFor(() => expect(screen.queryByRole('group', { name: r.erase.confirmTitle })).not.toBeInTheDocument());
  });

  it('should delete the account only after its own confirmation', async () => {
    const props = setup(locale);
    fireEvent.click(screen.getByRole('button', { name: r.deleteAccount.button }));
    expect(props.onDeleteAccount).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: r.deleteAccount.confirm }));
    await waitFor(() => expect(props.onDeleteAccount).toHaveBeenCalledTimes(1));
    expect(props.onErase).not.toHaveBeenCalled();
  });

  it('should show a fixed error when the account cannot be deleted', async () => {
    setup(locale, { onDeleteAccount: vi.fn(async () => false) });
    fireEvent.click(screen.getByRole('button', { name: r.deleteAccount.button }));
    fireEvent.click(screen.getByRole('button', { name: r.deleteAccount.confirm }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(r.deleteAccount.error));
  });
});

describe('format helpers', () => {
  it('should format a stored time in the language of the app and ignore anything that is not a time', () => {
    expect(formatStamp('2026-10-22T09:30:00Z', 'en')).toMatch(/2026/);
    expect(formatStamp('2026-10-22T09:30:00Z', 'cs')).toMatch(/2026/);
    expect(formatStamp('nonsense', 'en')).toBeNull();
    expect(formatStamp(null, 'en')).toBeNull();
    expect(formatStamp(undefined, 'cs')).toBeNull();
  });

  it('should name the sign in method from the provider of the user', () => {
    expect(signInMethod({ app_metadata: { provider: 'google' } })).toBe('google');
    expect(signInMethod({ app_metadata: { provider: 'email' } })).toBe('email');
    expect(signInMethod({ app_metadata: { provider: 'github' } })).toBe('other');
    expect(signInMethod({ app_metadata: {} })).toBe('other');
    expect(signInMethod(null)).toBe('other');
  });
});
