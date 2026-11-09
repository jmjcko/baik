import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { mockPrePurchaseResponse } from '@/types/__tests__/baikfit.mock';
import { AuthProvider, type AuthClient } from '@/lib/auth/AuthContext';
import { fakeAuthClient, riderSession } from '@/test/fakeAuthClient';
import { decideConsent, resetConsents, useConsent } from '@/lib/consent/useConsent';
import { useConsentSync } from '@/lib/consent/useConsentSync';
import { CONSENT_PURPOSES } from '@/lib/consent/purposes';
import { PrePurchaseAuditView } from '@/components/prepurchasing/PrePurchaseAuditView';
import { BikeFinder } from '@/components/finder/BikeFinder';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { ConsentSection } from '../ConsentSection';

const analyzeMock = vi.fn();
vi.mock('@/app/actions/analyzeBikeGeometry', () => ({ analyzeBikeGeometry: (...args: unknown[]) => analyzeMock(...args) }));
vi.mock('@/app/actions/findBikes', () => ({ recommendBikes: vi.fn(), readGeometryTable: vi.fn() }));

const renderAudit = (locale: Locale) =>
  render(
    <PrePurchaseAuditView
      t={translations[locale]} locale={locale} inseamMm={840} acromionWidthMm={420} heightCm={178} torsoLengthMm={600} armLengthMm={640}
      riderWeightKg={75} ridingStyle="balanced" currentPains={['saddle_sores']} onBackToEntry={vi.fn()}
    />
  );

describe.each(['en', 'cs'] as Locale[])('the consent to the AI service in the pre-purchase audit (%s)', (locale) => {
  const t = translations[locale];
  const a = t.prePurchaseAudit;
  const runAudit = () => {
    fireEvent.click(screen.getByText(a.nextStepButton));
    fireEvent.change(screen.getByLabelText(a.bikeModelLabel), { target: { value: 'Canyon Endurace CF 8 2024' } });
    fireEvent.click(screen.getByText(a.runAuditButton));
  };

  beforeEach(() => {
    analyzeMock.mockReset();
    analyzeMock.mockResolvedValue({ success: true, data: mockPrePurchaseResponse });
  });

  it('should ask first, list the data that is sent, and call nothing until the rider answers', () => {
    renderAudit(locale);
    runAudit();
    const panel = screen.getByTestId('consent-prompt-ai_processing');
    expect(within(panel).getByText(t.consent.audit.title)).toBeInTheDocument();
    for (const item of t.consent.purposes.ai_processing.data) expect(within(panel).getByText(item)).toBeInTheDocument();
    expect(within(panel).getByRole('link', { name: t.consent.prompt.privacyLink })).toHaveAttribute('href', '/privacy');
    expect(analyzeMock).not.toHaveBeenCalled();
  });

  it('should run the audit with the AI service after the rider agrees, and remember the answer', async () => {
    renderAudit(locale);
    runAudit();
    fireEvent.click(screen.getByRole('button', { name: t.consent.audit.allow }));
    await waitFor(() => expect(screen.getByText(mockPrePurchaseResponse.recommendedFrameSize)).toBeInTheDocument());
    expect(analyzeMock.mock.calls[0][0]).toMatchObject({ aiConsent: true });
    expect(screen.queryByTestId('audit-rules-only')).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('baik_consents') ?? '{}').ai_processing).toMatchObject({ granted: true, version: 1 });
  });

  it('should run the audit on the rules alone when the rider declines, and say so in the report', async () => {
    renderAudit(locale);
    runAudit();
    fireEvent.click(screen.getByRole('button', { name: t.consent.audit.decline }));
    await waitFor(() => expect(screen.getByText(mockPrePurchaseResponse.recommendedFrameSize)).toBeInTheDocument());
    expect(analyzeMock.mock.calls[0][0]).toMatchObject({ aiConsent: false });
    expect(screen.getByTestId('audit-rules-only')).toHaveTextContent(t.consent.audit.declinedNote);
  });

  it('should not ask again after an answer, and a declined answer keeps the AI service off', async () => {
    decideConsent('ai_processing', false);
    renderAudit(locale);
    runAudit();
    await waitFor(() => expect(analyzeMock).toHaveBeenCalledTimes(1));
    expect(screen.queryByTestId('consent-prompt-ai_processing')).not.toBeInTheDocument();
    expect(analyzeMock.mock.calls[0][0]).toMatchObject({ aiConsent: false });
  });
});

describe.each(['en', 'cs'] as Locale[])('the consent to the AI service in the bike finder (%s)', (locale) => {
  const t = translations[locale];
  const finder = () => render(<BikeFinder t={t} locale={locale} onAudit={vi.fn()} rider={{ heightCm: 178, inseamMm: 840, torsoLengthMm: 600, armLengthMm: 640, acromionWidthMm: 400, riderWeightKg: 75, flexibilityScore: 'moderate', ridingStyle: 'balanced', currentPains: [], bikeKind: 'road' }} />);

  it('should show the question instead of the finder until the rider agrees', () => {
    finder();
    expect(screen.getByTestId('consent-prompt-ai_processing')).toHaveTextContent(t.consent.finder.title);
    expect(screen.queryByTestId('finder-question')).not.toBeInTheDocument();
  });

  it('should say what is needed after a refusal and open the questions after an agreement', () => {
    finder();
    fireEvent.click(screen.getByRole('button', { name: t.consent.prompt.decline }));
    expect(screen.getByRole('status')).toHaveTextContent(t.consent.prompt.needed);
    fireEvent.click(screen.getByRole('button', { name: t.consent.prompt.allow }));
    expect(screen.queryByTestId('consent-prompt-ai_processing')).not.toBeInTheDocument();
    expect(screen.getByTestId('finder-question')).toBeInTheDocument();
  });
});

describe.each(['en', 'cs'] as Locale[])('the consents section (%s)', (locale) => {
  const t = translations[locale];
  const s = t.consent.section;

  it('should list every purpose as not asked yet, agree, and withdraw as easily', () => {
    render(<ConsentSection t={t} />);
    for (const purpose of CONSENT_PURPOSES) expect(screen.getByTestId(`consent-state-${purpose}`)).toHaveTextContent(s.stateUnknown);
    const row = screen.getByTestId('consent-row-ai_processing');
    fireEvent.click(within(row).getByRole('button', { name: s.give }));
    expect(screen.getByTestId('consent-state-ai_processing')).toHaveTextContent(s.stateGranted);
    fireEvent.click(within(row).getByRole('button', { name: s.withdraw }));
    expect(screen.getByTestId('consent-state-ai_processing')).toHaveTextContent(s.stateDeclined);
  });

  it('should tell that the stored data stays after the storage consent is withdrawn', () => {
    decideConsent('health_storage', true);
    render(<ConsentSection t={t} />);
    const row = screen.getByTestId('consent-row-health_storage');
    expect(within(row).queryByText(s.withdrawHealthNote)).not.toBeInTheDocument();
    fireEvent.click(within(row).getByRole('button', { name: s.withdraw }));
    expect(within(row).getByText(s.withdrawHealthNote)).toBeInTheDocument();
  });

  it('should show no emoji', () => {
    render(<ConsentSection t={t} />);
    expect(document.body.textContent).not.toMatch(/\p{Extended_Pictographic}/u);
  });
});

describe.each(['en', 'cs'] as Locale[])('the consent at registration (%s)', (locale) => {
  const t = translations[locale];

  it('should record the consent to the storage of health data when the rider creates an account', async () => {
    const fake = fakeAuthClient();
    render(<AuthProvider client={fake.client}><AuthDialog t={t} open onClose={vi.fn()} /></AuthProvider>);
    fireEvent.click(screen.getByRole('tab', { name: t.auth.tabSignUp }));
    fireEvent.change(screen.getByLabelText(new RegExp(t.auth.emailLabel)), { target: { value: 'rider@example.com' } });
    fireEvent.change(screen.getByLabelText(new RegExp(t.auth.passwordLabel)), { target: { value: 'correct horse' } });
    fireEvent.click(screen.getByRole('button', { name: t.auth.submitSignUp }));
    expect(localStorage.getItem('baik_consents')).toBeNull();
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: t.auth.submitSignUp }));
    await waitFor(() => expect(fake.auth.signUp).toHaveBeenCalled());
    expect(JSON.parse(localStorage.getItem('baik_consents') ?? '{}').health_storage).toMatchObject({ granted: true });
  });

  it('should link the privacy page from the dialog', () => {
    render(<AuthProvider client={fakeAuthClient().client}><AuthDialog t={t} open onClose={vi.fn()} /></AuthProvider>);
    expect(screen.getByRole('link', { name: t.consent.section.privacyLink })).toHaveAttribute('href', '/privacy');
  });
});

describe('the sync of the consents with the account', () => {
  const Probe: React.FC = () => {
    useConsentSync();
    return <p data-testid="strava">{useConsent('strava').state}</p>;
  };
  const signedInClient = (rows: unknown[]) => {
    const fake = fakeAuthClient();
    const upsert = vi.fn(async () => ({ error: null }));
    const client = { ...fake.client, from: () => ({ select: () => ({ eq: async () => ({ data: rows, error: null }) }), upsert }) } as unknown as AuthClient;
    return { fake, client, upsert };
  };

  beforeEach(() => resetConsents());

  it('should take the decisions of the account into this browser and send the local ones to the account', async () => {
    decideConsent('ai_processing', true);
    const { fake, client, upsert } = signedInClient([{ purpose: 'strava', text_version: 1, granted: true, decided_at: '2026-11-09T10:00:00.000Z' }]);
    render(<AuthProvider client={client}><Probe /></AuthProvider>);
    act(() => fake.emit('SIGNED_IN', riderSession));
    await waitFor(() => expect(screen.getByTestId('strava')).toHaveTextContent('granted'));
    await waitFor(() => expect(upsert).toHaveBeenCalled());
    const rows = (upsert.mock.calls[0] as unknown as [Array<{ purpose: string; user_id: string }>])[0];
    expect(rows.map((row) => row.purpose).sort()).toEqual(['ai_processing', 'strava']);
    expect(rows.every((row) => row.user_id === 'u1')).toBe(true);
  });

  it('should do nothing for a guest', () => {
    decideConsent('ai_processing', true);
    const { client, upsert } = signedInClient([]);
    render(<AuthProvider client={client}><Probe /></AuthProvider>);
    expect(upsert).not.toHaveBeenCalled();
  });
});
