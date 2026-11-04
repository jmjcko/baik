import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { computeBikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import type { StockSelection } from '@/lib/bikes/types';
import type { RiderPainType } from '@/types/baikfit';
import { DiagnosticReport } from '../DiagnosticReport';

const canyonM: StockSelection = { source: 'seed', bikeId: 'canyon-endurace-cf-8-di2-2024', size: 'M' };

function renderReport(locale: Locale, over: { stockBike?: StockSelection | null; currentPains?: RiderPainType[] } = {}) {
  const handlers = { onOpenCadStudio: vi.fn(), onEditMeasurements: vi.fn() };
  const props = {
    t: translations[locale], inseamMm: 840, acromionWidthMm: 380, crankLengthMm: 170, riderWeightKg: 75, currentPains: [] as RiderPainType[],
    currentSaddleHeightMm: 726, currentBarWidthMm: 440, coordinates: computeBikeFitCoordinates({ inseamMm: 840 }), ...handlers, ...over,
  };
  return { ...render(<DiagnosticReport {...props} />), ...handlers };
}

const before = (a: HTMLElement, b: HTMLElement) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

describe.each(['en', 'cs'] as Locale[])('the layout of the report (%s)', (locale) => {
  const t = translations[locale];
  const r = t.diagnosticReport;

  it('should show the four target numbers and the cockpit in the side column, every explanation closed and one opening on a press', () => {
    renderReport(locale);
    const side = within(screen.getByTestId('report-summary').closest('aside') as HTMLElement);
    for (const key of ['saddle', 'handlebar', 'crank', 'setback']) expect(side.getByTestId(`target-${key}`)).toBeInTheDocument();
    expect(side.getByText(r.targets.cockpitTitle)).toBeInTheDocument();
    expect(within(side.getByTestId('target-saddle')).getByRole('button')).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(within(side.getByTestId('target-saddle')).getByRole('button'));
    expect(within(side.getByTestId('target-saddle')).getByRole('button')).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(within(side.getByTestId('target-handlebar')).getByRole('button'));
    expect(within(side.getByTestId('target-handlebar')).getByRole('button')).toHaveAttribute('aria-expanded', 'true');
    expect(within(side.getByTestId('target-saddle')).getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  });

  it('should keep the buttons and the numbers in a summary beside the report, not in the header', () => {
    const { onOpenCadStudio, onEditMeasurements } = renderReport(locale, { currentPains: ['numb_hands'] });
    const summary = within(screen.getByTestId('report-summary'));
    expect(summary.getByText(r.summaryTitle)).toBeInTheDocument();
    expect(summary.getByText(new RegExp(`^${r.summarySteps.split('{n}')[0]}\\d+$`))).toBeInTheDocument();
    fireEvent.click(summary.getByRole('button', { name: r.openCadButton }));
    fireEvent.click(summary.getByRole('button', { name: r.editInputsButton }));
    expect(onOpenCadStudio).toHaveBeenCalledTimes(1);
    expect(onEditMeasurements).toHaveBeenCalledTimes(1);
    expect(within(screen.getByTestId('page-header')).queryAllByRole('button').map((b) => b.textContent)).not.toContain(r.openCadButton);
  });

  it('should make two columns from the large width on and put the summary first on a narrow screen, without a button count of its own', () => {
    renderReport(locale);
    const aside = screen.getByTestId('report-summary').closest('aside') as HTMLElement;
    expect(aside.className).toContain('order-first');
    expect(aside.className).toContain('lg:order-none');
    expect(aside.className).toContain('lg:sticky');
    expect(aside.parentElement?.className).toContain('lg:grid-cols-');
  });

  it('should order the report: the plan, the details and then the audit of the stock bike; the target numbers are beside it', () => {
    renderReport(locale, { stockBike: canyonM, currentPains: ['numb_hands'] });
    const at = (id: string) => document.getElementById(id) as HTMLElement;
    expect(before(at('report-plan'), at('report-details'))).toBe(true);
    expect(before(at('report-details'), at('stock-audit'))).toBe(true);
    expect(at('report-numbers').closest('aside')).not.toBeNull();
  });

  it('should show the fit of the stock bike in the summary, and nothing about a stock bike without one', () => {
    const { unmount } = renderReport(locale, { stockBike: canyonM });
    expect(within(screen.getByTestId('report-summary')).getByText(/9\d\s?%|\d\d\s?%/)).toBeInTheDocument();
    unmount();
    renderReport(locale);
    expect(screen.queryByTestId('stock-audit')).not.toBeInTheDocument();
    expect(within(screen.getByTestId('report-summary')).queryByText(/%/)).not.toBeInTheDocument();
  });

  it('should carry no emoji and no hard-coded colour in the summary', () => {
    renderReport(locale);
    const summary = screen.getByTestId('report-summary');
    expect(summary.textContent).not.toMatch(/\p{Extended_Pictographic}/u);
    expect(summary.innerHTML).not.toMatch(/\b(bg|text|border)-(slate-(?!50\b)|white|black|gray|zinc)/);
  });
});
