import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { PromptStep } from '../PromptStep';

const EMOJI = /\p{Extended_Pictographic}/u;

describe.each(['en', 'cs'] as Locale[])('the guide under the master prompt (%s)', (locale) => {
  const t = translations[locale];
  const g = t.gear.useGuide;
  const renderStep = () => render(<PromptStep t={t} parameters={[]} notes="" onNotes={() => undefined} onOpen={() => undefined} />);

  it('should show on the last page, after the button, with the steps of ChatGPT first and a link to open it', () => {
    renderStep();
    const guide = within(screen.getByTestId('prompt-guide'));
    expect(guide.getByRole('heading', { name: g.title })).toBeInTheDocument();
    expect(screen.getByTestId('prompt-open').compareDocumentPosition(screen.getByTestId('prompt-guide')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(guide.getByTestId('guide-chatgpt')).toHaveAttribute('aria-pressed', 'true');
    expect(guide.getAllByRole('listitem').slice(0, 3).map((li) => li.textContent)).toEqual([...g.platforms.chatgpt.steps]);
    const open = guide.getByTestId('guide-open');
    expect(open).toHaveTextContent(fill(g.open, { name: 'ChatGPT' }));
    expect(open).toHaveAttribute('href', 'https://chatgpt.com');
    expect(open).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should switch to the steps and the link of another chatbot', () => {
    renderStep();
    fireEvent.click(screen.getByTestId('guide-perplexity'));
    expect(screen.getByTestId('guide-perplexity')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('guide-chatgpt')).toHaveAttribute('aria-pressed', 'false');
    expect(within(screen.getByTestId('guide-steps')).getAllByRole('listitem').map((li) => li.textContent)).toEqual([...g.platforms.perplexity.steps]);
    expect(screen.getByTestId('guide-open')).toHaveAttribute('href', 'https://www.perplexity.ai');
  });

  it('should say what to do with the answer: four steps, sources and checking the fit, and that nothing is sent by bAIkgear', () => {
    renderStep();
    expect(within(screen.getByTestId('guide-after')).getAllByRole('listitem').map((li) => li.textContent)).toEqual([...g.after]);
    expect(screen.getByTestId('prompt-guide')).toHaveTextContent(g.privacy);
  });

  it('should carry no emoji and no hard-coded colour', () => {
    const { container } = renderStep();
    const guide = screen.getByTestId('prompt-guide');
    expect(guide.textContent).not.toMatch(EMOJI);
    expect(guide.innerHTML).not.toMatch(/\b(bg|text|border)-(slate-(?!50\b)|white|black|gray|zinc)/);
    for (const icon of Array.from(container.querySelectorAll('svg'))) expect(icon).toHaveAttribute('aria-hidden', 'true');
  });
});
