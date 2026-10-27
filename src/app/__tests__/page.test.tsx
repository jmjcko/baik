import { render, screen, within, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import HomePage from '../page';
import { translations } from '@/lib/i18n/translations';
import { storedPassport } from '@/test/storedPassport';

// Mock server action for deterministic client testing
vi.mock('@/app/actions/analyzeBikeGeometry', async () => {
  const { mockPrePurchaseResponse } = await import('@/types/__tests__/baikfit.mock');
  return {
    analyzeBikeGeometry: vi.fn().mockResolvedValue({
      success: true,
      data: mockPrePurchaseResponse,
    }),
  };
});

describe('bAIkfit - Guided Multi-Step Architecture & Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders the sidebar with module tabs and system controls, and the slim header with the account status', () => {
    render(<HomePage />);
    const nav = within(screen.getByRole('navigation', { name: translations.en.shell.sidebar.mainLabel }));
    expect(screen.getAllByText('bAIk').length).toBeGreaterThanOrEqual(1);
    for (const name of ['bAIkfit', 'bAIkcare', 'bAIkshop']) expect(nav.getByText(name)).toBeInTheDocument();
    expect(screen.queryByText(/bAIk\w+ (Engine|Studio|Advisory)/)).not.toBeInTheDocument();
    expect(nav.getAllByText('Coming Soon')).toHaveLength(2);
    expect(screen.getByRole('group', { name: translations.en.navigation.languageLabel })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: translations.en.navigation.themeLabel })).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBe(screen.getByTestId('app-header'));
    expect(screen.getByTestId('header-status')).toHaveTextContent(translations.en.shell.header.status.guest);
  });

  it('renders the dashboard as the entry screen with the call to action and the check of a bike', () => {
    render(<HomePage />);
    const d = translations.en.shell.dashboard;
    expect(screen.getByRole('heading', { level: 1, name: d.title })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: d.hero.title })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: d.hero.start })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: d.hero.checkBike })).toBeInTheDocument();
  });

  it('switches between EN and CS from the sidebar', () => {
    render(<HomePage />);
    const en = screen.getByRole('button', { name: 'EN' });
    const cs = screen.getByRole('button', { name: 'CS' });
    expect(en).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(cs);
    expect(cs).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('heading', { level: 1, name: translations.cs.shell.dashboard.title })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: translations.cs.shell.dashboard.hero.title })).toBeInTheDocument();

    fireEvent.click(en);
    expect(screen.getByRole('heading', { level: 1, name: translations.en.shell.dashboard.title })).toBeInTheDocument();
  });

  it('switches the theme from the sidebar with text labels only', () => {
    render(<HomePage />);
    fireEvent.click(screen.getByRole('button', { name: translations.en.navigation.themeDark }));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    fireEvent.click(screen.getByRole('button', { name: translations.en.navigation.themeLight }));
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('shows a guest block with a disabled sign in button', () => {
    render(<HomePage />);
    expect(screen.getByText(translations.en.navigation.guestLabel)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: translations.en.navigation.signInSoon })).toBeDisabled();
  });

  it('navigates through Path A: Wizard -> Diagnostic Report -> CAD Studio simulator', () => {
    render(<HomePage />);
    // Click Path A CTA
    const startWizardBtn = screen.getByText(translations.en.shell.dashboard.hero.start);
    fireEvent.click(startWizardBtn);

    // Step 1: Discipline, then Step 2: Morphology
    expect(screen.getByRole('heading', { name: translations.en.wizard.disciplineTitle })).toBeInTheDocument();
    fireEvent.click(screen.getByText(translations.en.wizard.continueToBody));
    expect(screen.getByRole('heading', { name: translations.en.wizard.bodyTitle })).toBeInTheDocument();
    expect(screen.getByText(translations.en.wizard.inseamAccordionTitle)).toBeInTheDocument();
    expect(screen.getByText(translations.en.wizard.acromionAccordionTitle)).toBeInTheDocument();

    // Step 3: Posture & Symptoms
    fireEvent.click(screen.getByText(translations.en.wizard.continueToPosture));
    expect(screen.getByRole('heading', { name: translations.en.wizard.postureTitle })).toBeInTheDocument();

    // Toggle pain
    const numbHandsBtn = screen.getByText(translations.en.studio.pains.numb_hands);
    fireEvent.click(numbHandsBtn);

    // Step 4: Current bike, then complete the wizard -> Diagnostic Report
    fireEvent.click(screen.getByText(translations.en.wizard.continueToBike));
    expect(screen.getByRole('heading', { name: translations.en.wizard.bikeTitle })).toBeInTheDocument();
    const completeBtn = screen.getByText(translations.en.wizard.toReportButton);
    fireEvent.click(completeBtn);

    expect(screen.getByText(translations.en.diagnosticReport.title)).toBeInTheDocument();
    const openCadButtons = screen.getAllByText(translations.en.diagnosticReport.openCadButton);
    expect(openCadButtons.length).toBeGreaterThanOrEqual(1);

    // Open CAD Studio from Report
    fireEvent.click(openCadButtons[0]);

    // Now in CAD Studio
    expect(screen.getByText(translations.en.studio.cadHeader)).toBeInTheDocument();
    expect(screen.getByText(translations.en.studio.telemetryHeader)).toBeInTheDocument();

    // Telemetry calculations
    expect(screen.getByText(translations.en.studio.saddleY)).toBeInTheDocument();
    expect(screen.getByText('742')).toBeInTheDocument();

    // The studio is a simulator: apply a change to the profile and store it in LocalStorage
    fireEvent.click(screen.getByText('165'));
    const saveBtn = screen.getByText(translations.en.studio.saveButton);
    fireEvent.click(saveBtn);

    const saved = storedPassport();
    expect(saved).not.toBeNull();
    expect(saved?.anatomy.inseamMm).toBe(840);
    expect(saved?.bikes[0].components?.crankLengthMm).toBe(165);
    expect(saved?.targets?.saddleHeightMm).toBe(742);

    expect(screen.getByText(translations.en.studio.savedToProfile)).toBeInTheDocument();
  });

  it('navigates to Path B: Pre-Purchase Geometry Matcher and executes AI audit', async () => {
    render(<HomePage />);
    const pathBBtn = screen.getByText(translations.en.shell.dashboard.hero.checkBike);
    fireEvent.click(pathBBtn);

    // Step 1: Rider Morphology & Riding Intent Intake
    expect(screen.getByText(translations.en.prePurchaseAudit.step1Title)).toBeInTheDocument();
    const nextBtn = screen.getByRole('button', { name: translations.en.prePurchaseAudit.nextStepButton });
    fireEvent.click(nextBtn);

    // Step 2: Prospective Bike Search
    expect(screen.getByText(translations.en.prePurchaseAudit.step2Title)).toBeInTheDocument();
    const bikeInput = screen.getByPlaceholderText(translations.en.prePurchaseAudit.bikeModelPlaceholder);
    expect(bikeInput).toBeInTheDocument();
    expect(bikeInput).toHaveValue('');
    fireEvent.change(bikeInput, { target: { value: 'Canyon Endurace CF 8 2024' } });

    const analyzeBtn = screen.getByRole('button', { name: translations.en.prePurchaseAudit.runAuditButton });
    fireEvent.click(analyzeBtn);

    // Step 3: Deep Biomechanical Audit Report View
    await waitFor(() => {
      expect(screen.getByText('94%')).toBeInTheDocument();
      expect(screen.getByText('M (Medium)')).toBeInTheDocument();
      expect(screen.getByText(/Stack: \+17 mm/)).toBeInTheDocument();
      expect(screen.getByText(translations.en.prePurchaseAudit.cardProsConsTitle)).toBeInTheDocument();
      expect(screen.getByText(translations.en.prePurchaseAudit.cardTrapsTitle)).toBeInTheDocument();
      expect(screen.getByText(translations.en.prePurchaseAudit.cardChecklistTitle)).toBeInTheDocument();
      expect(screen.getByText(translations.en.prePurchaseAudit.cardAlternativesTitle)).toBeInTheDocument();
    });
  });
});
