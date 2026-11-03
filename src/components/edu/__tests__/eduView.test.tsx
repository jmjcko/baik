import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { EduView } from '../EduView';

const EMOJI = /\p{Extended_Pictographic}/u;

describe.each(['en', 'cs'] as Locale[])('the bAIkedu academy (%s)', (locale) => {
  const t = translations[locale];
  const e = t.edu;
  const cards = () => screen.queryAllByTestId(/^edu-card-/);
  const renderView = (onOpenTool = vi.fn()) => { render(<EduView t={t} onOpenTool={onOpenTool} />); return onOpenTool; };

  it('should show the six articles with the reading time, topics, title, teaser and a read button, and the count', () => {
    renderView();
    expect(cards()).toHaveLength(6);
    expect(screen.getByTestId('edu-count')).toHaveTextContent(fill(e.count, { n: 6 }));
    const card = within(screen.getByTestId('edu-card-m-check'));
    expect(card.getByText(fill(e.readTime, { min: 2 }))).toBeInTheDocument();
    expect(card.getByRole('heading', { name: e.articles['m-check'].title })).toBeInTheDocument();
    expect(card.getByText(e.articles['m-check'].teaser)).toBeInTheDocument();
    expect(card.getByRole('button', { name: `${e.read}: ${e.articles['m-check'].title}` })).toBeInTheDocument();
    expect(card.getByText(e.tags.care)).toBeInTheDocument();
  });

  it('should filter by topic with pressed chips and go back to all', () => {
    renderView();
    fireEvent.click(screen.getByTestId('edu-filter-tyres'));
    expect(screen.getByTestId('edu-filter-tyres')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('edu-filter-all')).toHaveAttribute('aria-pressed', 'false');
    expect(cards().map((c) => c.getAttribute('data-testid')).sort()).toEqual(['edu-card-bike-weight', 'edu-card-tyre-science']);
    fireEvent.click(screen.getByTestId('edu-filter-all'));
    expect(cards()).toHaveLength(6);
  });

  it('should search by keyword, also with the topic, and say so when nothing matches', () => {
    renderView();
    fireEvent.change(screen.getByTestId('edu-search'), { target: { value: locale === 'en' ? 'bonk' : 'bonk' } });
    expect(cards().map((c) => c.getAttribute('data-testid'))).toEqual(['edu-card-fuelling']);
    fireEvent.click(screen.getByTestId('edu-filter-care'));
    expect(cards()).toHaveLength(0);
    expect(screen.getByTestId('edu-empty')).toHaveTextContent(e.empty);
  });

  it('should open an article in place of the feed with the key facts, the sources and the general note, and go back', () => {
    renderView();
    fireEvent.click(within(screen.getByTestId('edu-card-tyre-science')).getByRole('button'));
    const detail = within(screen.getByTestId('edu-detail'));
    expect(screen.queryByTestId('edu-view')).toBeNull();
    expect(detail.getByRole('heading', { name: e.articles['tyre-science'].title })).toBeInTheDocument();
    expect(detail.getAllByRole('listitem').filter((li) => e.articles['tyre-science'].points.includes(li.textContent ?? ''))).toHaveLength(3);
    expect(detail.getByText(e.general)).toBeInTheDocument();
    const sources = within(screen.getByTestId('edu-sources'));
    const link = sources.getByRole('link', { name: fill(e.sourceVideo, { channel: 'The Aero Hour', title: "Wider Tyres Aren't Faster. Here's What Is." }) });
    expect(link).toHaveAttribute('href', 'https://www.youtube.com/watch?v=AG4N5zeTSw4&t=0s');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByTestId('edu-detail')).toHaveTextContent(e.articles['tyre-science'].source as string);
    fireEvent.click(screen.getByTestId('edu-back'));
    expect(cards()).toHaveLength(6);
  });

  it('should name every source video of an article as "Source: YouTube - channel: title", two for the fuelling article', () => {
    renderView();
    fireEvent.click(within(screen.getByTestId('edu-card-fuelling')).getByRole('button'));
    expect(within(screen.getByTestId('edu-sources')).getAllByRole('link').map((a) => a.textContent)).toEqual([
      fill(e.sourceVideo, { channel: 'tristantakevideo', title: '20 Things I WISH I Knew as a Beginner Road Cyclist' }),
      fill(e.sourceVideo, { channel: 'tristantakevideo', title: 'BEGINNER CYCLIST to INTERMEDIATE: 8 Tips to ride FASTER, for LONGER' }),
    ]);
    expect(screen.getByTestId('edu-sources').textContent).toContain(locale === 'en' ? 'Source: YouTube' : 'Zdroj: YouTube');
  });

  it('should lead to the right tool from the detail: care for the tyres, fit for the nerves, nothing for the fuelling', () => {
    const open = renderView();
    const read = (id: string) => fireEvent.click(within(screen.getByTestId(`edu-card-${id}`)).getByRole('button'));
    read('tyre-science');
    fireEvent.click(screen.getByTestId('edu-open-tool'));
    expect(screen.getByTestId('edu-open-tool')).toHaveTextContent(e.openTool.care);
    expect(open).toHaveBeenLastCalledWith('care');
    fireEvent.click(screen.getByTestId('edu-back'));
    read('numb-hands');
    expect(screen.getByTestId('edu-open-tool')).toHaveTextContent(e.openTool.fit);
    fireEvent.click(screen.getByTestId('edu-open-tool'));
    expect(open).toHaveBeenLastCalledWith('fit');
    expect(screen.getByTestId('edu-note')).toHaveTextContent(e.articles['numb-hands'].note as string);
    fireEvent.click(screen.getByTestId('edu-back'));
    read('fuelling');
    expect(screen.queryByTestId('edu-open-tool')).toBeNull();
  });

  it('should carry no emoji and no hard-coded colour classes', () => {
    const { container } = render(<EduView t={t} onOpenTool={() => undefined} />);
    expect(container.textContent).not.toMatch(EMOJI);
    expect(container.innerHTML).not.toMatch(/\b(bg|text|border)-(slate-(?!50\b)|white|black|gray|zinc)/);
    for (const icon of Array.from(container.querySelectorAll('svg'))) expect(icon).toHaveAttribute('aria-hidden', 'true');
  });
});
