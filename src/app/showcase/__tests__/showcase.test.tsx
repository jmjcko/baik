import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { DIAGNOSIS_IDS } from '@/lib/engines/baikfit/diagnostics';
import ShowcasePage, { metadata } from '../page';
import { ShowcaseClient } from '../ShowcaseClient';
import { RIDERS, SADDLE_STATES, saddleTarget } from '../fixtures';

const SECTIONS = ['targets', 'schematics', 'guides', 'diagnosis', 'studio'];

afterEach(() => {
  vi.unstubAllEnvs();
  document.documentElement.removeAttribute('data-theme');
});

describe('showcase route (development only)', () => {
  it('should render the gallery outside production and be excluded from search engines', () => {
    expect(ShowcasePage()).toBeTruthy();
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it('should not exist in production: the page calls notFound()', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(() => ShowcasePage()).toThrow();
  });
});

describe('showcase gallery', () => {
  it('should render every section with the real components in all agreed states', () => {
    render(<ShowcaseClient />);
    for (const id of SECTIONS) expect(screen.getByTestId(`showcase-${id}`)).toBeInTheDocument();
    for (const rider of RIDERS) expect(screen.getByText(rider.name)).toBeInTheDocument();
    for (const state of SADDLE_STATES) expect(screen.getByText(`Saddle height: ${state.label}`)).toBeInTheDocument();
    for (const label of ['Optimal 1:1 (380 mm)', '420 mm factory trap']) expect(screen.getByText(`Handlebar width: ${label}`)).toBeInTheDocument();
    for (const label of ['Recommended (165 mm)', 'Stock 172.5 mm (knee 7.5 mm higher)']) expect(screen.getByText(`Crank length: ${label}`)).toBeInTheDocument();
    expect(screen.getByText('Saddle pitch')).toBeInTheDocument();
    expect(screen.getByText('Cleat position')).toBeInTheDocument();
  });

  it('should show the saddle deltas of the states and mark states without a finding', () => {
    render(<ShowcaseClient />);
    expect(screen.getByText('+31 mm')).toBeInTheDocument();
    expect(screen.getByText('−15 mm')).toBeInTheDocument();
    expect(screen.getAllByText(/No finding in the report/)).toHaveLength(2);
    expect(saddleTarget(850)).toBe(751);
  });

  it('should open the five guides and show all diagnosis cards and the empty state', () => {
    render(<ShowcaseClient />);
    for (const id of ['saddle', 'pitch', 'handlebar', 'crank', 'cleat']) expect(screen.getByTestId(`howto-${id}`)).toHaveAttribute('open');
    for (const id of DIAGNOSIS_IDS) expect(screen.getByTestId(`diagnosis-${id}`)).toHaveAttribute('open');
    expect(screen.getByText(translations.en.diagnosis.noSymptoms)).toBeInTheDocument();
  });

  it('should redraw the wireframe and the telemetry when the inseam slider moves and show both toasts inline', () => {
    render(<ShowcaseClient />);
    fireEvent.change(screen.getByLabelText(translations.en.studio.inseamLabel), { target: { value: '900' } });
    const studio = screen.getByTestId('showcase-studio');
    expect(within(studio).getAllByText('795').length).toBeGreaterThan(0);
    expect(within(studio).getByRole('status')).toHaveTextContent(translations.en.studio.savedToProfile);
    expect(within(studio).getByRole('alert')).toHaveTextContent(translations.en.studio.saveFailed);
    expect(within(studio).getByRole('status')).not.toHaveClass('fixed');
  });
});

describe('showcase theme switch', () => {
  it('should apply the light and dark themes to the document', () => {
    render(<ShowcaseClient />);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    fireEvent.click(screen.getByRole('button', { name: 'Dark' }));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(screen.getByRole('button', { name: 'Dark' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Light' }));
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('should render every section twice side by side inside containers that scope the light and the dark tokens', () => {
    render(<ShowcaseClient />);
    fireEvent.click(screen.getByRole('button', { name: 'Side by side' }));
    const light = screen.getByTestId('themed-light');
    const dark = screen.getByTestId('themed-dark');
    expect(light).toHaveAttribute('data-theme', 'light');
    expect(dark).toHaveAttribute('data-theme', 'dark');
    for (const id of SECTIONS) {
      expect(within(light).getByTestId(`showcase-${id}`)).toBeInTheDocument();
      expect(within(dark).getByTestId(`showcase-${id}`)).toBeInTheDocument();
    }
    fireEvent.click(screen.getByRole('button', { name: 'Light' }));
    expect(screen.queryByTestId('themed-dark')).not.toBeInTheDocument();
  });
});

describe.each(['en', 'cs'] as Locale[])('showcase language (%s)', (locale) => {
  it('should switch every section to the dictionary and leave no unfilled placeholder', () => {
    render(<ShowcaseClient />);
    if (locale === 'cs') fireEvent.click(screen.getByRole('button', { name: 'CS' }));
    const t = translations[locale];
    expect(document.documentElement.lang).toBe(locale);
    expect(screen.getAllByText(t.diagnosticReport.targetsTitle).length).toBeGreaterThan(0);
    expect(screen.getAllByText(t.diagnosis.heading).length).toBeGreaterThan(0);
    expect(document.body.textContent).not.toMatch(/\{\w+\}/);
  });
});
