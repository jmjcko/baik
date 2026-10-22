import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act, within } from '@testing-library/react';
import HomePage from '../page';
import { translations, type Locale } from '@/lib/i18n/translations';
import { storedPassport } from '@/test/storedPassport';

function openStudio(locale: Locale): void {
  const t = translations[locale];
  render(<HomePage />);
  if (locale === 'cs') fireEvent.click(screen.getByRole('button', { name: 'CS' }));
  fireEvent.click(screen.getByText(t.entryRouter.pathAButton));
  fireEvent.click(screen.getByText(t.wizard.continueToBody));
  fireEvent.click(screen.getByText(t.wizard.continueToPosture));
  fireEvent.click(screen.getByText(t.wizard.continueToBike));
  fireEvent.click(screen.getByText(t.wizard.toReportButton));
  fireEvent.click(screen.getAllByText(t.diagnosticReport.openCadButton)[0]);
}

describe.each(['en', 'cs'] as Locale[])('CAD studio interaction (%s)', (locale) => {
  const t = translations[locale];

  beforeEach(() => {
    localStorage.clear();
    openStudio(locale);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it.each(['saddleY', 'saddleX', 'stack', 'reach'] as const)('should explain %s relative to the bottom bracket in an accessible tooltip', (key) => {
    const label = { saddleY: t.studio.saddleY, saddleX: t.studio.saddleX, stack: t.studio.stack, reach: t.studio.reach }[key];
    const trigger = screen.getByRole('button', { name: label });
    expect(trigger).toHaveAccessibleDescription(t.studio.tips[key]);
    expect(t.studio.tips[key]).toContain('(0,0)');
  });

  it('should open the tooltip on tap and close it with Escape', () => {
    const trigger = screen.getByRole('button', { name: t.studio.stack });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('should redraw the drawing footer and the telemetry in the same render as a slider moves', () => {
    fireEvent.change(screen.getByLabelText(t.studio.inseamLabel), { target: { value: '900' } });
    const telemetry = screen.getByText(t.studio.telemetryHeader).parentElement as HTMLElement;
    expect(within(telemetry).getByText('795')).toBeInTheDocument();
    expect(screen.getByText(/\[-?\d+, 762\] mm/)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${t.studio.wireframeSaddle.replace('{value}', '795')}`))).toBeInTheDocument();
  });

  it('should store the passport with the exact targets in LocalStorage and confirm with a toast listing them', () => {
    fireEvent.click(screen.getByText('165'));
    fireEvent.click(screen.getByText(t.studio.saveButton));
    expect(storedPassport()?.targets).toMatchObject({ saddleHeightMm: 742, saddleSetbackMm: -210, cockpitReachMm: 384, cockpitStackMm: 567, kbVersion: '1.1.0' });
    expect(storedPassport()?.bikes[0].components?.crankLengthMm).toBe(165);
    const toast = screen.getByRole('status');
    expect(toast).toHaveTextContent(t.studio.savedToProfile);
    expect(toast).toHaveTextContent(t.studio.toastDetail.replace('{height}', '742').replace('{setback}', '-210').replace('{stack}', '567').replace('{reach}', '384'));
  });

  it('should close the toast on click and by itself after about four seconds', () => {
    fireEvent.click(screen.getByText('165'));
    fireEvent.click(screen.getByText(t.studio.saveButton));
    fireEvent.click(screen.getByText(t.studio.toastDismiss));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    vi.useFakeTimers();
    fireEvent.click(screen.getByText('160'));
    fireEvent.click(screen.getByText(t.studio.saveButton));
    expect(screen.getByRole('status')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(4100));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('should show an error toast when the browser storage is not available', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    fireEvent.click(screen.getByText('165'));
    fireEvent.click(screen.getByText(t.studio.saveButton));
    expect(screen.getByRole('alert')).toHaveTextContent(t.studio.saveFailed);
  });
});

describe.each(['en', 'cs'] as Locale[])('CAD studio simulator keeps the profile until it is applied (%s)', (locale) => {
  const t = translations[locale];
  const storedInseam = () => storedPassport()?.anatomy.inseamMm;
  const moveInseam = (value: string) => fireEvent.change(screen.getByLabelText(t.studio.inseamLabel), { target: { value } });

  beforeEach(() => {
    localStorage.clear();
    openStudio(locale);
  });

  it('should open with the values of the profile and with both buttons disabled while nothing was changed', () => {
    expect(screen.getByLabelText(t.studio.inseamLabel)).toHaveValue('840');
    expect(screen.getByRole('button', { name: t.studio.saveButton })).toBeDisabled();
    expect(screen.getByRole('button', { name: t.studio.restoreButton })).toBeDisabled();
    expect(screen.getByText(t.studio.sandboxNote)).toBeInTheDocument();
  });

  it('should keep the profile, the stored profile and the report untouched while the simulator is changed', () => {
    moveInseam('900');
    expect(screen.getByRole('button', { name: t.studio.saveButton })).toBeEnabled();
    expect(storedInseam()).toBe(840);
    expect(screen.getByText('840 mm')).toBeInTheDocument();
    fireEvent.click(screen.getByText(t.studio.viewReport));
    expect(screen.getByText(t.diagnosticReport.title)).toBeInTheDocument();
    expect(storedInseam()).toBe(840);
  });

  it('should put the profile values back with the restore button', () => {
    moveInseam('900');
    fireEvent.click(screen.getByRole('button', { name: t.studio.restoreButton }));
    expect(screen.getByLabelText(t.studio.inseamLabel)).toHaveValue('840');
    expect(screen.getByRole('button', { name: t.studio.saveButton })).toBeDisabled();
  });

  it('should write the simulator values to the profile and the report with the apply button', () => {
    moveInseam('900');
    fireEvent.click(screen.getByRole('button', { name: t.studio.saveButton }));
    expect(storedInseam()).toBe(900);
    expect(screen.getAllByText('900 mm').length).toBeGreaterThan(0);
    expect(screen.getByRole('status')).toHaveTextContent(t.studio.savedToProfile);
    fireEvent.click(screen.getByText(t.studio.viewReport));
    expect(screen.getAllByText(new RegExp('795')).length).toBeGreaterThan(0);
  });

  it('should start a fresh copy of the profile every time the studio is opened', () => {
    moveInseam('900');
    fireEvent.click(screen.getByText(t.studio.viewReport));
    fireEvent.click(screen.getAllByText(t.diagnosticReport.openCadButton)[0]);
    expect(screen.getByLabelText(t.studio.inseamLabel)).toHaveValue('840');
  });
});
