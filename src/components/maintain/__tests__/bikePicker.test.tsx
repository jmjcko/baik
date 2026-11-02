import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { translations } from '@/lib/i18n/translations';
import { BikePicker } from '../BikePicker';

const BIKES = [{ id: 'a', name: 'Cube Attain 2027' }, { id: 'b', name: 'Superior XF' }];

describe.each(['en', 'cs'] as const)('BikePicker (%s)', (locale) => {
  const t = translations[locale];

  it('lists all the bikes and switches to the chosen one', () => {
    const onSwitch = vi.fn();
    render(<BikePicker t={t} bikes={BIKES} activeId="a" fallbackName="Cube Attain 2027" onSwitch={onSwitch} />);
    const select = screen.getByTestId('care-bike-select') as HTMLSelectElement;
    expect(select.value).toBe('a');
    expect(select.options).toHaveLength(2);
    fireEvent.change(select, { target: { value: 'b' } });
    expect(onSwitch).toHaveBeenCalledWith('b');
  });

  it('shows only the name when there is no other bike to choose', () => {
    render(<BikePicker t={t} bikes={[BIKES[0]]} activeId="a" fallbackName="Cube Attain 2027" onSwitch={vi.fn()} />);
    expect(screen.queryByTestId('care-bike-select')).toBeNull();
    expect(screen.getByTestId('care-bike').textContent).toContain('Cube Attain 2027');
  });
});
