import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { DEFAULT_CARE } from '@/types/maintain';
import { Harness, TODAY } from '@/test/garageHarness';
import { openCare } from '@/test/careNav';
import { wheelsStatus } from '../CareTasks';

const EMOJI = /\p{Extended_Pictographic}/u;

describe.each(['en', 'cs'] as Locale[])('the guided check of the workshop (%s)', (locale) => {
  const t = translations[locale];
  const g = t.care.guide;
  const finishAll = () => {
    for (let i = 0; i < 7; i++) {
      const prefix = i < 5 ? 'node' : 'tyre';
      fireEvent.click(screen.getByTestId(`${prefix}-result-${i === 1 ? 'warn' : 'pass'}`));
      fireEvent.click(screen.getByTestId('step-next'));
    }
  };

  it('should end in a summary with the counts and the advice, and offer to write the check into the service book or to skip', () => {
    render(<Harness locale={locale} />);
    finishAll();
    const summary = within(screen.getByTestId('check-summary'));
    expect(summary.getByText(fill(g.summaryTitle, { n: 7, total: 7 }))).toBeInTheDocument();
    expect(screen.getByTestId('check-summary')).toHaveTextContent(fill(g.summaryCounts, { ok: 6, warn: 1, fail: 0 }));
    expect(screen.getByTestId('check-summary')).toHaveTextContent(g.summaryAttention);
    expect(screen.getByTestId('check-banner')).toHaveTextContent(g.bannerDoneTitle);
    fireEvent.click(summary.getByTestId('check-skip'));
    expect(screen.queryByTestId('check-summary')).not.toBeInTheDocument();
  });

  it('should open the form of the service book with the day and the results of all places when the check is written into it', () => {
    render(<Harness locale={locale} />);
    finishAll();
    fireEvent.click(screen.getByTestId('check-book'));
    expect(screen.getByTestId('entry-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('entry-day')).toHaveValue(TODAY);
    const note = (screen.getByTestId('entry-note') as HTMLTextAreaElement | HTMLInputElement).value;
    expect(note).toContain(`${t.care.nodes['2'].short}: ${t.care.status.warn}`);
    expect(note).toContain(`${t.wheels.points.rear}: ${t.care.status.pass}`);
    expect(screen.queryByTestId('check-book')).not.toBeInTheDocument();
  });

  it('should hold five tasks under the check, all closed at the start, with the title and the sentence of each', () => {
    render(<Harness locale={locale} />);
    expect(within(screen.getByTestId('care-tasks')).getAllByRole('button')).toHaveLength(5);
    for (const task of ['chain', 'wheels', 'trainer', 'fix', 'wash'] as const) {
      expect(screen.getByTestId(`task-${task}`)).toHaveAttribute('aria-expanded', 'false');
      expect(screen.getByTestId(`task-${task}`)).toHaveTextContent(g.tasks[task].title);
      expect(screen.getByTestId(`task-${task}`)).toHaveTextContent(g.tasks[task].text);
    }
    expect(screen.queryByTestId('care-panel')).not.toBeInTheDocument();
  });

  it('should open one task at a time below the row and close it with the same press', () => {
    render(<Harness locale={locale} />);
    openCare('wash');
    expect(screen.getByTestId('care-panel')).toHaveAttribute('data-item', 'wash');
    openCare('trainer');
    expect(screen.getByTestId('care-panel')).toHaveAttribute('data-item', 'trainer');
    expect(screen.getByTestId('task-wash')).toHaveAttribute('aria-expanded', 'false');
    openCare('trainer');
    expect(screen.queryByTestId('care-panel')).not.toBeInTheDocument();
  });

  it('should warn on the wheels task when the sealant is due or a tyre was found worn, and not otherwise', () => {
    const due = { ...DEFAULT_CARE, tubeless: true, sealantAt: '2026-05-01' };
    expect(wheelsStatus(DEFAULT_CARE, TODAY)).toBeNull();
    expect(wheelsStatus(due, TODAY)).toBe('warn');
    expect(wheelsStatus({ ...due, sealantAt: '2026-01-01' }, TODAY)).toBe('fail');
    expect(wheelsStatus({ ...DEFAULT_CARE, tyres: { front: 'fail', rear: 'unchecked' } }, TODAY)).toBe('warn');
    render(<Harness locale={locale} initial={due} />);
    expect(screen.getByTestId('task-wheels-status')).toHaveAccessibleName(t.care.status.warn);
    expect(screen.queryByTestId('task-trainer-status')).not.toBeInTheDocument();
  });

  it('should explain in plain words what M-Check means and what the rider does, with no emoji and no hard-coded colour', () => {
    const { container } = render(<Harness locale={locale} />);
    expect(screen.getByTestId('check-banner')).toHaveTextContent('M-Check');
    expect(screen.getByTestId('check-banner')).toHaveTextContent(g.bannerText);
    expect(JSON.stringify(g)).not.toMatch(EMOJI);
    const html = `${screen.getByTestId('check-banner').innerHTML}${screen.getByTestId('step-panel').innerHTML}${screen.getByTestId('check-list').innerHTML}${screen.getByTestId('care-tasks').innerHTML}`;
    expect(html).not.toMatch(/\b(bg|text|border)-(slate-(?!50\b)|white|black|gray|zinc)/);
    expect(container.querySelectorAll('[data-testid="step-panel"]')).toHaveLength(1);
  });
});
