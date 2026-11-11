import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { IntervalsGuide } from '../IntervalsGuide';

describe.each(['en', 'cs'] as Locale[])('the guide to the athlete id and the key (%s)', (locale) => {
  const texts = translations[locale].service.logbook.intervals.guide;

  it('should be closed at first, name the three steps and describe the sketch for a screen reader', () => {
    render(<IntervalsGuide texts={texts} />);
    const guide = screen.getByTestId('intervals-guide');
    expect(guide).not.toHaveAttribute('open');
    expect(within(guide).getAllByRole('listitem')).toHaveLength(3);
    expect(within(guide).getByRole('img', { name: texts.diagram.label })).toBeInTheDocument();
    expect(guide.textContent).toContain(texts.english);
  });

  it('should show the names of the places in the sketch as the words of this language', () => {
    render(<IntervalsGuide texts={texts} />);
    const svg = screen.getByRole('img', { name: texts.diagram.label });
    for (const word of [texts.diagram.settings, texts.diagram.developer, texts.diagram.athleteId, texts.diagram.apiKey]) expect(svg.textContent).toContain(word);
  });

  it('should not claim that the servers never see the key, and should tell what an athlete id looks like', () => {
    const intervals = translations[locale].service.logbook.intervals;
    expect(intervals.intro).not.toMatch(/never see|nikdy neuvid/i);
    expect(intervals.form.athleteHint).toContain('i123456');
  });
});
