import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { PostureStep } from '../PostureStep';
import { MiniTests } from '../MiniTests';

describe.each(['en', 'cs'] as Locale[])('the mobility mini-tests (%s)', (locale) => {
  const t = translations[locale];
  const m = t.miniTests;

  function setup(over: Partial<React.ComponentProps<typeof MiniTests>> = {}) {
    const props = { t, hamstringTest: null, setHamstringTest: vi.fn(), releaseTest: null, setReleaseTest: vi.fn(), ...over } as React.ComponentProps<typeof MiniTests>;
    render(<MiniTests {...props} />);
    return props;
  }

  it('should show both tests with their steps, the drawing and the options of the specification', () => {
    setup();
    for (const [id, card] of [['hamstring-test', m.hamstring], ['release-test', m.release]] as const) {
      const section = within(screen.getByTestId(id));
      expect(section.getByRole('heading', { name: card.title })).toBeInTheDocument();
      for (const step of card.steps) expect(section.getByText(step)).toBeInTheDocument();
      expect(section.getByRole('img', { name: id === 'hamstring-test' ? m.hamstring.diagramLabel : m.release.diagramLabel })).toBeInTheDocument();
    }
    expect(screen.getByTestId('hamstring-diagram')).toHaveTextContent('60°');
    expect(screen.getByTestId('hamstring-diagram')).toHaveTextContent('75°');
    expect(screen.getByTestId('release-diagram')).toHaveTextContent('2 cm');
    expect(screen.getAllByRole('radio')).toHaveLength(5);
    for (const answer of ['low', 'medium', 'high'] as const) expect(screen.getByRole('radio', { name: new RegExp(m.hamstring.options[answer].title) })).toBeInTheDocument();
    for (const answer of ['slumping', 'stable'] as const) expect(screen.getByRole('radio', { name: new RegExp(m.release.options[answer].title) })).toBeInTheDocument();
  });

  it('should hand over the answer of the rider, and clear it when the same answer is chosen again', () => {
    const props = setup({ hamstringTest: 'low' });
    fireEvent.click(screen.getByRole('radio', { name: new RegExp(m.hamstring.options.medium.title) }));
    expect(props.setHamstringTest).toHaveBeenCalledWith('medium');
    fireEvent.click(screen.getByRole('radio', { name: new RegExp(m.hamstring.options.low.title) }));
    expect(props.setHamstringTest).toHaveBeenLastCalledWith(null);
    fireEvent.click(screen.getByRole('radio', { name: new RegExp(m.release.options.slumping.title) }));
    expect(props.setReleaseTest).toHaveBeenCalledWith('slumping');
  });

  it('should say what a low result and slumping change, with the numbers of the engine, and nothing for the other answers', () => {
    setup({ hamstringTest: 'low', releaseTest: 'slumping' });
    expect(screen.getAllByRole('status').map((node) => node.textContent)).toEqual([fill(m.hamstring.options.low.effect, { stack: 18 }), fill(m.release.options.slumping.effect, { setback: 7 })]);
    expect(screen.getByRole('radio', { name: new RegExp(m.hamstring.options.low.title) })).toHaveAttribute('aria-checked', 'true');
  });

  it('should say that the other answers change nothing, and show no effect before an answer', () => {
    const { unmount } = render(<MiniTests t={t} hamstringTest="high" setHamstringTest={vi.fn()} releaseTest="stable" setReleaseTest={vi.fn()} />);
    expect(screen.getAllByRole('status').map((node) => node.textContent)).toEqual([m.hamstring.options.high.effect, m.release.options.stable.effect]);
    unmount();
    setup();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('should be part of wizard step 3 when the app provides the state, and absent otherwise', () => {
    const base = { t, ridingStyle: 'balanced' as const, setRidingStyle: vi.fn(), currentPains: [], togglePain: vi.fn() };
    const { unmount } = render(<PostureStep {...base} />);
    expect(screen.queryByTestId('mini-tests')).not.toBeInTheDocument();
    unmount();
    render(<PostureStep {...base} hamstringTest={null} setHamstringTest={vi.fn()} releaseTest={null} setReleaseTest={vi.fn()} />);
    expect(screen.getByTestId('mini-tests')).toBeInTheDocument();
  });
});
