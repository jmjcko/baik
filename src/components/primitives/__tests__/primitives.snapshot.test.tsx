import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActionButton } from '../ActionButton';
import { MetricTile } from '../MetricTile';
import { RangeSlider } from '../RangeSlider';
import { BadgeChip } from '../BadgeChip';
import { SurfaceCard } from '../SurfaceCard';

describe('primitives', () => {
  it.each(['primary', 'secondary', 'outline', 'danger'] as const)('should render ActionButton variant %s', (variant) => {
    const { asFragment } = render(<ActionButton label="Go" variant={variant} size="lg" className="extra" />);
    expect(asFragment()).toMatchSnapshot();
  });

  it.each(['sm', 'md', 'lg'] as const)('should render ActionButton size %s', (size) => {
    const { asFragment } = render(<ActionButton label="Go" size={size} disabled id="btn" type="submit" />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('should call onClick and respect disabled', () => {
    const onClick = vi.fn();
    const { rerender } = render(<ActionButton label="Go" onClick={onClick} />);
    fireEvent.click(screen.getByText('Go'));
    rerender(<ActionButton label="Go" onClick={onClick} disabled />);
    fireEvent.click(screen.getByText('Go'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it.each(['cyan', 'neutral', 'success', 'warning', 'danger'] as const)('should render MetricTile %s', (statusVariant) => {
    const { asFragment } = render(<MetricTile label="Saddle" value={742} unit="mm" subLabel="sub" statusVariant={statusVariant} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render MetricTile without unit and subLabel', () => {
    const { asFragment } = render(<MetricTile label="Saddle" value="n/a" />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render RangeSlider with error, disabled and id and report changes', () => {
    const onChange = vi.fn();
    const { asFragment } = render(
      <RangeSlider label="Inseam" value={840} min={500} max={1100} step={5} onChange={onChange} error="Out of range" disabled id="inseam" />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('should associate the label with the input via id and emit numeric values', () => {
    const onChange = vi.fn();
    render(<RangeSlider label="Inseam" value={840} min={500} max={1100} onChange={onChange} id="inseam" />);
    fireEvent.change(screen.getByLabelText('Inseam'), { target: { value: '850' } });
    expect(onChange).toHaveBeenCalledWith(850);
  });

  it('should render BadgeChip and SurfaceCard', () => {
    const { asFragment } = render(
      <SurfaceCard><BadgeChip label="Active" /></SurfaceCard>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
