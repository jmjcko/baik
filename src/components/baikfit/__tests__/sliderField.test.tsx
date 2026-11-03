import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RangeSlider } from '@/components/primitives/RangeSlider';
import { SliderField } from '../fields/SliderField';

const field = (value: number, accent: 'blue' | 'teal' = 'blue') => (
  <SliderField id="s" label="Shoulders" valueText={`${value} mm`} value={value} min="340" max="500" step="5" accent={accent} onChange={() => undefined} />
);

describe('range sliders', () => {
  it('should draw the filled share of the track from the value, so the empty part is not the white native track of a dark theme', () => {
    render(field(420));
    const input = screen.getByLabelText('Shoulders');
    expect(input).toHaveClass('range-input');
    expect(input.style.getPropertyValue('--pct')).toBe('50%');
  });

  it('should keep the share between 0 and 100 percent and show an empty track for an empty range', () => {
    const { rerender } = render(field(200));
    expect(screen.getByLabelText('Shoulders').style.getPropertyValue('--pct')).toBe('0%');
    rerender(field(900));
    expect(screen.getByLabelText('Shoulders').style.getPropertyValue('--pct')).toBe('100%');
    rerender(<SliderField id="s" label="Shoulders" valueText="1" value={1} min="5" max="5" step="1" onChange={() => undefined} />);
    expect(screen.getByLabelText('Shoulders').style.getPropertyValue('--pct')).toBe('0%');
  });

  it('should mark the teal slider so the stylesheet uses the calm teal, and keep blue as the default', () => {
    const { rerender } = render(field(420));
    expect(screen.getByLabelText('Shoulders')).toHaveAttribute('data-accent', 'blue');
    rerender(field(420, 'teal'));
    expect(screen.getByLabelText('Shoulders')).toHaveAttribute('data-accent', 'teal');
  });

  it('should fill the primitive slider in the same way', () => {
    render(<RangeSlider id="r" label="Inseam" value={750} min={500} max={1000} onChange={() => undefined} />);
    expect(screen.getByLabelText('Inseam').style.getPropertyValue('--pct')).toBe('50%');
    expect(screen.getByLabelText('Inseam')).toHaveClass('range-input');
  });
});
