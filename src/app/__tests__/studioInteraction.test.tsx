import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act, within } from '@testing-library/react';
import HomePage from '../page';
import { translations, type Locale } from '@/lib/i18n/translations';
import { RIDER_PROFILE_STORAGE_KEY } from '@/lib/engines/baikfit/coordinates';

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

  it('should store the exact XY coordinates in LocalStorage and confirm with a toast listing them', () => {
    fireEvent.click(screen.getByText(t.studio.saveButton));
    const stored = JSON.parse(localStorage.getItem(RIDER_PROFILE_STORAGE_KEY) ?? '{}');
    expect(stored.coordinates).toMatchObject({
      saddle: { heightAlongTubeMm: 742, verticalYMm: 711, setbackXMm: -210 },
      cockpit: { reachXMm: 384, stackYMm: 567 },
    });
    expect(typeof stored.savedAt).toBe('string');
    const toast = screen.getByRole('status');
    expect(toast).toHaveTextContent(t.studio.savedToProfile);
    expect(toast).toHaveTextContent(t.studio.toastDetail.replace('{height}', '742').replace('{setback}', '-210').replace('{stack}', '567').replace('{reach}', '384'));
  });

  it('should close the toast on click and by itself after about four seconds', () => {
    fireEvent.click(screen.getByText(t.studio.saveButton));
    fireEvent.click(screen.getByText(t.studio.toastDismiss));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    vi.useFakeTimers();
    fireEvent.click(screen.getByText(t.studio.saveButton));
    expect(screen.getByRole('status')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(4100));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('should show an error toast when the browser storage is not available', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    fireEvent.click(screen.getByText(t.studio.saveButton));
    expect(screen.getByRole('alert')).toHaveTextContent(t.studio.saveFailed);
  });
});
