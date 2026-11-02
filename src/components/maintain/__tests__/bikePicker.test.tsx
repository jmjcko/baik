import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { translations } from '@/lib/i18n/translations';
import { BikePicker } from '../BikePicker';

const BIKES = [{ id: 'a', name: 'Cube Attain 2027' }, { id: 'b', name: 'Superior XF' }, { id: 'c', name: 'Sup Verca' }];

describe.each(['en', 'cs'] as const)('BikePicker (%s)', (locale) => {
  const t = translations[locale];
  const setup = () => {
    const onSwitch = vi.fn();
    render(<BikePicker t={t} bikes={BIKES} activeId="a" fallbackName="Cube Attain 2027" onSwitch={onSwitch} />);
    return onSwitch;
  };

  it('should show the active bike on the button and the list only when it is open', () => {
    setup();
    const trigger = screen.getByTestId('care-bike-trigger');
    expect(trigger.textContent).toContain('Cube Attain 2027');
    expect(screen.queryByTestId('care-bike-menu')).toBeNull();
    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getAllByRole('option')).toHaveLength(3);
    expect(screen.getByTestId('care-bike-option-a').getAttribute('aria-selected')).toBe('true');
  });

  it('should switch to the clicked bike and close the list', () => {
    const onSwitch = setup();
    fireEvent.click(screen.getByTestId('care-bike-trigger'));
    fireEvent.click(screen.getByTestId('care-bike-option-b'));
    expect(onSwitch).toHaveBeenCalledWith('b');
    expect(screen.queryByTestId('care-bike-menu')).toBeNull();
    expect(document.activeElement).toBe(screen.getByTestId('care-bike-trigger'));
  });

  it('should not switch when the active bike is chosen again', () => {
    const onSwitch = setup();
    fireEvent.click(screen.getByTestId('care-bike-trigger'));
    fireEvent.click(screen.getByTestId('care-bike-option-a'));
    expect(onSwitch).not.toHaveBeenCalled();
  });

  it('should be used with the keyboard: arrows move, Enter chooses, Escape closes', () => {
    const onSwitch = setup();
    fireEvent.keyDown(screen.getByTestId('care-bike-trigger'), { key: 'ArrowDown' });
    const menu = screen.getByTestId('care-bike-menu');
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(screen.getByTestId('care-bike-option-c'));
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(screen.getByTestId('care-bike-option-a'));
    fireEvent.keyDown(menu, { key: 'End' });
    fireEvent.keyDown(menu, { key: 'Enter' });
    expect(onSwitch).toHaveBeenCalledWith('c');
    fireEvent.click(screen.getByTestId('care-bike-trigger'));
    fireEvent.keyDown(screen.getByTestId('care-bike-menu'), { key: 'Escape' });
    expect(screen.queryByTestId('care-bike-menu')).toBeNull();
  });

  it('should close on a click outside', () => {
    setup();
    fireEvent.click(screen.getByTestId('care-bike-trigger'));
    fireEvent.mouseDown(document.body);
    expect(screen.queryByTestId('care-bike-menu')).toBeNull();
  });

  it('should show only the name when there is no other bike to choose', () => {
    render(<BikePicker t={t} bikes={[BIKES[0]]} activeId="a" fallbackName="Cube Attain 2027" onSwitch={vi.fn()} />);
    expect(screen.queryByTestId('care-bike-trigger')).toBeNull();
    expect(screen.getByTestId('care-bike').textContent).toContain('Cube Attain 2027');
  });
});
