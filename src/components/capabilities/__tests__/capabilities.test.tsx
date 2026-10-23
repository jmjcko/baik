import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { CAPABILITIES, CAPABILITY_PLANES } from '../capabilities';
import { CapabilitiesView } from '../CapabilitiesView';

const EXPECTED: Record<string, string[]> = {
  feet: ['cleatSetback', 'stance', 'cleatFloat', 'shoeWidth', 'insoles'],
  saddle: ['saddleHeight', 'setback', 'tilt', 'cutout', 'saddleWidth'],
  cockpit: ['barWidth', 'dropStack', 'reach', 'leverRotation', 'leverReach'],
  cranks: ['crankLength', 'diagnostics', 'stockAudit', 'tirePressure', 'miniTests'],
};

describe('the list of the capabilities', () => {
  it('should hold exactly the 20 parameters of the four planes of the specification, five in each', () => {
    expect(CAPABILITIES).toHaveLength(20);
    expect(new Set(CAPABILITIES.map((item) => item.id)).size).toBe(20);
    for (const plane of CAPABILITY_PLANES) expect(CAPABILITIES.filter((item) => item.plane === plane).map((item) => item.id)).toEqual(EXPECTED[plane]);
  });

  it('should give every parameter one of the four statuses, and every status at least one parameter', () => {
    const statuses = new Set(CAPABILITIES.map((item) => item.status));
    expect([...statuses].sort()).toEqual(['calculated', 'clinical', 'educational', 'interactive']);
  });
});

describe.each(['en', 'cs'] as Locale[])('the fitting capabilities page (%s)', (locale) => {
  const t = translations[locale];
  const c = t.capabilities;

  it('should show the title and the four planes with their titles and intros', () => {
    render(<CapabilitiesView t={t} onTakeTests={vi.fn()} />);
    expect(screen.getByRole('heading', { level: 1, name: c.title })).toBeInTheDocument();
    for (const plane of CAPABILITY_PLANES) {
      expect(screen.getByRole('heading', { level: 2, name: c.planes[plane].title })).toBeInTheDocument();
      expect(screen.getByText(c.planes[plane].intro)).toBeInTheDocument();
    }
  });

  it('should draw all 20 parameters, five in every plane, each with its name, its text and its status badge', () => {
    render(<CapabilitiesView t={t} onTakeTests={vi.fn()} />);
    expect(screen.getAllByTestId('capability')).toHaveLength(20);
    for (const plane of CAPABILITY_PLANES) {
      const section = within(screen.getByTestId(`plane-${plane}`));
      expect(section.getAllByTestId('capability')).toHaveLength(5);
    }
    for (const item of CAPABILITIES) {
      const card = screen.getByRole('heading', { level: 3, name: c.items[item.id].name }).closest('li') as HTMLElement;
      expect(within(card).getByText(c.items[item.id].text)).toBeInTheDocument();
      expect(within(card).getByTestId('capability-status')).toHaveTextContent(c.statuses[item.status].label);
      expect(within(card).getByTestId('capability-status')).toHaveAttribute('data-status', item.status);
    }
  });

  it('should explain the four badges in a legend', () => {
    render(<CapabilitiesView t={t} onTakeTests={vi.fn()} />);
    const legend = screen.getByRole('heading', { name: c.legendTitle }).closest('div') as HTMLElement;
    for (const status of ['calculated', 'educational', 'clinical', 'interactive'] as const) {
      expect(within(legend).getByText(c.statuses[status].label)).toBeInTheDocument();
      expect(within(legend).getByText(c.statuses[status].meaning)).toBeInTheDocument();
    }
  });

  it('should have no emoji or icon in the page and lead from the mini-tests parameter to the tests', () => {
    const onTakeTests = vi.fn();
    const { container } = render(<CapabilitiesView t={t} onTakeTests={onTakeTests} />);
    expect(container.textContent).not.toMatch(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
    expect(container.querySelector('svg')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: c.takeTests }));
    expect(onTakeTests).toHaveBeenCalledTimes(1);
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });
});

describe('the texts of the two languages', () => {
  it('should have a name and a text for every parameter in both languages, and the same statuses', () => {
    for (const item of CAPABILITIES) {
      for (const locale of ['en', 'cs'] as Locale[]) {
        const texts = translations[locale].capabilities.items[item.id];
        expect(texts.name.trim().length).toBeGreaterThan(2);
        expect(texts.text.trim().length).toBeGreaterThan(20);
      }
      expect(translations.cs.capabilities.items[item.id].name).not.toBe(translations.en.capabilities.items[item.id].name);
    }
    expect(Object.keys(translations.en.capabilities.items).sort()).toEqual(Object.keys(translations.cs.capabilities.items).sort());
    expect(Object.keys(translations.en.capabilities.items)).toHaveLength(20);
  });
});
