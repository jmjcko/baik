import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import type { GearAnswer, GearParameter } from '@/types/gearTypes';
import { buildParameters, kbParameter } from '@/lib/gear/parameters';
import { ParamField, pressed } from '../ParamField';

const choice = (over: Partial<GearParameter> = {}): GearParameter => ({
  id: 'ai_battery', source: 'ai', kind: 'choice', importance: 'recommended', multi: true, label: 'Battery', hint: 'Hours per charge.',
  options: [{ value: '5-8 h', label: '5-8 h' }, { value: '8-12 h', label: '8-12 h' }, { value: '12+ h', label: '12+ h' }, { value: 'unknown', label: 'I do not know' }, { value: 'both', label: 'Both' }],
  ...over,
});

describe('pressing the options of a question', () => {
  it('should toggle several values on and off', () => {
    const p = choice();
    expect(pressed(p, [], '8-12 h')).toEqual(['8-12 h']);
    expect(pressed(p, ['8-12 h'], '12+ h')).toEqual(['8-12 h', '12+ h']);
    expect(pressed(p, ['8-12 h', '12+ h'], '8-12 h')).toEqual(['12+ h']);
  });

  it('should let "I do not know" and "Both" stand alone and take the other values back, and a value take them back', () => {
    const p = choice();
    expect(pressed(p, ['5-8 h', '8-12 h'], 'unknown')).toEqual(['unknown']);
    expect(pressed(p, ['8-12 h'], 'both')).toEqual(['both']);
    expect(pressed(p, ['unknown'], '12+ h')).toEqual(['12+ h']);
    expect(pressed(p, ['unknown'], 'unknown')).toEqual([]);
  });

  it('should keep one value for a question that is not multi', () => {
    const p = choice({ multi: false });
    expect(pressed(p, ['5-8 h'], '8-12 h')).toEqual(['8-12 h']);
    expect(pressed(p, ['8-12 h'], '8-12 h')).toEqual([]);
  });
});

describe.each(['en', 'cs'] as Locale[])('the questions of bAIkgear (%s)', (locale) => {
  const t = translations[locale];

  it('should make every question with options multi, from the knowledge base and from the research, but not the budget, the text or the brands', () => {
    const research = { productTitle: 'Radar', category: null, parameters: [{ id: 'ai_battery_0', name: 'Battery', importance: 'recommended' as const, rationale: 'x', suggestedValues: ['5-8 h', '8-12 h'], multi: false }, { id: 'ai_note_1', name: 'Note', importance: 'optional' as const, rationale: 'y', suggestedValues: [], multi: false }] };
    const list = buildParameters(t, null, research);
    expect(list.find((one) => one.id === 'ai_battery_0')?.multi).toBe(true);
    expect(list.find((one) => one.id === 'ai_note_1')?.multi).toBeFalsy();
    expect(kbParameter(t, 'seatpost').multi).toBe(true);
    expect(kbParameter(t, 'brands').multi).toBeFalsy();
  });

  it('should show the hint that several can be chosen, and let the rider press two values and get them as one answer', () => {
    const onChange = vi.fn<(answer: GearAnswer | null) => void>();
    const { rerender } = render(<ParamField t={t} parameter={choice()} answer={undefined} onChange={onChange} />);
    expect(screen.getByTestId('more-ai_battery')).toHaveTextContent(t.gear.chooseMore);
    fireEvent.click(screen.getByTestId('param-ai_battery-8-12 h'));
    expect(onChange).toHaveBeenLastCalledWith({ value: '8-12 h', fromGarage: false });
    rerender(<ParamField t={t} parameter={choice()} answer={{ value: '8-12 h', fromGarage: false }} onChange={onChange} />);
    fireEvent.click(screen.getByTestId('param-ai_battery-12+ h'));
    expect(onChange).toHaveBeenLastCalledWith({ value: '8-12 h, 12+ h', fromGarage: false });
  });
});
