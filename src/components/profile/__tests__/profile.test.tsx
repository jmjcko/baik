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
const passport = { ...profileToPassport(values, deriveCoordinates(values)), anatomy: { ...profileToPassport(values, deriveCoordinates(values)).anatomy, footLengthMm: 265, waistCircumferenceCm: 84 } };
const ready = (): StoredRecordState => ({ status: 'ready', record: { passport, createdAt: '2026-10-01T08:00:00Z', updatedAt: '2026-10-22T09:30:00Z' } });

function setup(locale: Locale, overrides: Partial<ProfileViewProps> = {}) {
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
    ...overrides,
  };
  render(<ProfileView {...props} />);
  return props;
}

describe.each(['en', 'cs'] as Locale[])('ProfileView (%s)', (locale) => {
  const p = translations[locale].profile;

  afterEach(() => vi.restoreAllMocks());

  it('should show the title and the four blocks', () => {
    setup(locale);
    expect(screen.getByRole('heading', { level: 1, name: p.title })).toBeInTheDocument();
    for (const name of [p.account.title, p.entered.title, p.calculated.title, p.rights.title]) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
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

  it('should list what the rider entered, with the optional measurements of the stored passport', () => {
    setup(locale);
    const t = translations[locale];
    expect(screen.getByText('850 mm')).toBeInTheDocument();
    expect(screen.getByText(t.studio.disciplines.road)).toBeInTheDocument();
    expect(screen.getByText(t.studio.ridingStyles.balanced)).toBeInTheDocument();
    expect(screen.getByText('700 mm')).toBeInTheDocument();
    expect(screen.getByText(p.entered.optional.footLengthMm)).toBeInTheDocument();
    expect(screen.getByText('265 mm')).toBeInTheDocument();
    expect(screen.getByText('84 cm')).toBeInTheDocument();
    expect(screen.queryByText(p.entered.optional.footWidthMm)).not.toBeInTheDocument();
    expect(screen.getAllByText(p.entered.notEntered)).toHaveLength(1);
  });

  it('should name the factory bike of the rider, or say that none is set', () => {
    const t = translations[locale];
    setup(locale, { values: { ...values, stockBike: { source: 'seed', bikeId: 'trek-domane-sl-6-gen-4-2024', size: '56' } } });
    expect(screen.getByText(t.profile.entered.factorySetup)).toBeInTheDocument();
    expect(screen.getByText('Trek Domane SL 6 Gen 4 2024, 56')).toBeInTheDocument();
  });

  it('should say that no factory setup is set', () => {
    setup(locale);
    expect(screen.getByText(translations[locale].profile.entered.factoryNone)).toBeInTheDocument();
  });

  it('should mark the symptoms as health data and list each one, or say none were reported', () => {
    setup(locale);
    const t = translations[locale];
    expect(screen.getByText(p.entered.healthTag)).toBeInTheDocument();
    expect(screen.getByText(t.studio.pains.numb_hands)).toBeInTheDocument();
    expect(screen.getByText(t.studio.pains.front_knee)).toBeInTheDocument();
  });

  it('should say none were reported when there are no symptoms', () => {
    setup(locale, { values: { ...values, currentPains: [] } });
    expect(screen.getByText(p.entered.symptomsNone)).toBeInTheDocument();
  });

  it('should open the matching setup step from each Change button', () => {
    const props = setup(locale);
    const groups = p.entered.groups;
    fireEvent.click(screen.getByRole('button', { name: `${p.entered.change}: ${groups.discipline}` }));
    fireEvent.click(screen.getByRole('button', { name: `${p.entered.change}: ${groups.body}` }));
    fireEvent.click(screen.getByRole('button', { name: `${p.entered.change}: ${groups.posture}` }));
    fireEvent.click(screen.getByRole('button', { name: `${p.entered.change}: ${groups.bike}` }));
    expect((props.onChange as ReturnType<typeof vi.fn>).mock.calls.map(([step]) => step)).toEqual(['discipline', 'body', 'posture', 'bike']);
  });

  it('should show the calculated targets with the knowledge base version and say they are not editable', () => {
    setup(locale);
    expect(screen.getByTestId('target-saddle')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2, name: translations[locale].diagnosticReport.targetsTitle })).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: translations[locale].diagnosticReport.targetsTitle })).toBeInTheDocument();
    expect(screen.getByTestId('kb-version')).toHaveTextContent(KB_VERSION);
    expect(screen.getByText(new RegExp(p.calculated.locked.slice(0, 20)))).toBeInTheDocument();
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
