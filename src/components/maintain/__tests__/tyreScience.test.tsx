import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { DEFAULT_CARE } from '@/types/maintain';
import { WheelsTyresCard } from '../WheelsTyresCard';

const EMOJI = /\p{Extended_Pictographic}/u;

describe.each(['en', 'cs'] as Locale[])('the tyre science corner (%s)', (locale) => {
  const t = translations[locale];
  const s = t.wheels.science;
  const card = () => screen.getByTestId('tyre-science');
  const renderWheels = () => render(<WheelsTyresCard t={t} care={DEFAULT_CARE} discipline="road" riderWeightKg={75} today="2026-11-03" onChange={() => undefined} onOpenFlat={() => undefined} />);

  it('should sit under the pressure guide, closed until opened, as a native details element', () => {
    renderWheels();
    const pressure = screen.getByTestId('pressure-guide');
    expect(pressure.parentElement).toContainElement(card());
    expect(pressure.compareDocumentPosition(card()) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(card().tagName).toBe('DETAILS');
    expect(card()).not.toHaveAttribute('open');
    expect(within(card()).getByText(s.title).closest('summary')).not.toBeNull();
  });

  it('should hold three numbered sections, three rules for the rider, the scope and the source, all as written in the dictionary', () => {
    renderWheels();
    const c = within(card());
    expect(s.sections).toHaveLength(3);
    for (const section of s.sections) {
      expect(c.getByRole('heading', { name: new RegExp(section.title) })).toBeInTheDocument();
      expect(c.getByText(section.body)).toBeInTheDocument();
    }
    expect(c.getByRole('heading', { name: s.rulesTitle })).toBeInTheDocument();
    expect(c.getAllByRole('listitem').map((li) => li.textContent)).toEqual([...s.rules]);
    expect(c.getByText(s.scope)).toBeInTheDocument();
    expect(c.getByText(s.source)).toBeInTheDocument();
  });

  it('should say that the lab, the vibration losses and the rule of 105 per cent are about paved roads, and leave the mountain bike to volume and grip', () => {
    renderWheels();
    expect(s.scope).toMatch(locale === 'en' ? /paved roads.*mountain bike/ : /zpevněné silnice.*horského kola/);
    expect(s.intro).toMatch(locale === 'en' ? /road, all-road and gravel/ : /silniční, all-road a gravel/);
  });

  it('should carry no emoji, no icon and no hard-coded colour, and no fixed pressure such as 50 psi', () => {
    renderWheels();
    expect(card().querySelector('svg')).toBeNull();
    expect(card().textContent).not.toMatch(EMOJI);
    expect(card().innerHTML).not.toMatch(/\b(bg|text|border)-(slate|white|black|gray|zinc)/);
    expect(card().textContent).not.toMatch(/50\s?psi|3[.,]5\s?(bar|baru)/i);
  });
});
