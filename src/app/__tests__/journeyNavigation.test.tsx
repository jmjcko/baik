import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import HomePage from '../page';
import { translations, type Locale } from '@/lib/i18n/translations';
import { JOURNEY_UNLOCKED_KEY } from '@/lib/hooks/useJourney';

function stepper(locale: Locale) {
  return screen.getByRole('navigation', { name: translations[locale].navigation.journeyTitle });
}

function startPathA(t: typeof translations.en) {
  fireEvent.click(screen.getByText(t.entryRouter.pathAButton));
}

function finishWizard(t: typeof translations.en) {
  fireEvent.click(screen.getByText(t.wizard.continueToBody));
  fireEvent.click(screen.getByText(t.wizard.continueToPosture));
  fireEvent.click(screen.getByText(t.wizard.continueToBike));
  fireEvent.click(screen.getByText(t.wizard.toReportButton));
}

describe('fixed app shell (story 10.1)', () => {
  it('should be exactly one viewport high with a fixed sidebar and a scrolling main panel', () => {
    const { container } = render(<HomePage />);
    expect(container.firstElementChild).toHaveClass('h-screen', 'overflow-hidden');
    expect(container.querySelector('aside')).toHaveClass('h-screen', 'overflow-y-auto');
    expect(container.querySelector('main')).toHaveClass('overflow-y-auto');
  });
});

describe.each(['en', 'cs'] as Locale[])('fit journey stepper (%s)', (locale) => {
  const t = translations[locale];

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  function selectLocale() {
    if (locale === 'cs') fireEvent.click(screen.getByRole('button', { name: 'CS' }));
  }

  it('should be hidden on the entry screen and shown with six steps inside the journey', () => {
    render(<HomePage />);
    selectLocale();
    expect(screen.queryByRole('navigation', { name: t.navigation.journeyTitle })).not.toBeInTheDocument();
    fireEvent.click(screen.getByText(t.entryRouter.pathAButton));
    const steps = within(stepper(locale)).getAllByRole('button');
    expect(steps.map((el) => el.textContent)).toEqual(Object.values(t.navigation.journeySteps).map((label, i) => `${i + 1}${label}`));
    expect(steps[0]).toHaveAttribute('aria-current', 'step');
  });

  it('should keep the report and the studio locked until the wizard was completed once', () => {
    render(<HomePage />);
    selectLocale();
    fireEvent.click(screen.getByText(t.entryRouter.pathAButton));
    const nav = within(stepper(locale));
    expect(nav.getByRole('button', { name: new RegExp(t.navigation.journeySteps.report) })).toBeDisabled();
    expect(nav.getByRole('button', { name: new RegExp(t.navigation.journeySteps.studio) })).toBeDisabled();
    expect(nav.getByRole('button', { name: new RegExp(t.navigation.journeySteps.bike) })).toBeEnabled();
  });

  it('should jump between wizard steps, the report and the studio and stay in sync with the buttons', () => {
    render(<HomePage />);
    selectLocale();
    fireEvent.click(screen.getByText(t.entryRouter.pathAButton));
    const go = (label: string) => fireEvent.click(within(stepper(locale)).getByRole('button', { name: new RegExp(label) }));

    go(t.navigation.journeySteps.bike);
    expect(screen.getByTestId('current-bike-step')).toBeInTheDocument();
    fireEvent.click(screen.getByText(t.wizard.toReportButton));
    expect(screen.getByText(t.diagnosticReport.title)).toBeInTheDocument();
    expect(localStorage.getItem(JOURNEY_UNLOCKED_KEY)).toBe('1');

    go(t.navigation.journeySteps.studio);
    expect(screen.getByText(t.studio.cadHeader)).toBeInTheDocument();
    go(t.navigation.journeySteps.report);
    expect(screen.getByText(t.diagnosticReport.title)).toBeInTheDocument();
    go(t.navigation.journeySteps.body);
    expect(screen.getByRole('heading', { name: t.wizard.bodyTitle })).toBeInTheDocument();
    expect(within(stepper(locale)).getByRole('button', { name: new RegExp(t.navigation.journeySteps.body) })).toHaveAttribute('aria-current', 'step');
  });

  it('should send the report edit button to the body measurements step', () => {
    render(<HomePage />);
    selectLocale();
    fireEvent.click(screen.getByText(t.entryRouter.pathAButton));
    fireEvent.click(screen.getByText(t.wizard.continueToBody));
    fireEvent.click(screen.getByText(t.wizard.continueToPosture));
    fireEvent.click(screen.getByText(t.wizard.continueToBike));
    fireEvent.click(screen.getByText(t.wizard.toReportButton));
    fireEvent.click(screen.getByText(t.diagnosticReport.editInputsButton));
    expect(screen.getByRole('heading', { name: t.wizard.bodyTitle })).toBeInTheDocument();
  });

  it('should remember the unlock after a reload', () => {
    localStorage.setItem(JOURNEY_UNLOCKED_KEY, '1');
    render(<HomePage />);
    selectLocale();
    fireEvent.click(screen.getByText(t.entryRouter.pathAButton));
    expect(within(stepper(locale)).getByRole('button', { name: new RegExp(t.navigation.journeySteps.studio) })).toBeEnabled();
  });

  it('should restart at the discipline step when the wizard is started from the entry screen', () => {
    render(<HomePage />);
    selectLocale();
    startPathA(t);
    fireEvent.click(screen.getByText(t.wizard.continueToBody));
    fireEvent.click(screen.getByText(t.wizard.backButton));
    fireEvent.click(screen.getByText(t.wizard.backButton));
    startPathA(t);
    expect(screen.getByRole('heading', { name: t.wizard.disciplineTitle })).toBeInTheDocument();
    finishWizard(t);
  });
});
