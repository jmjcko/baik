import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InfoTip } from '../InfoTip';
import { Toast } from '../Toast';
import { MetricTile } from '../MetricTile';

describe('InfoTip', () => {
  it('should describe its button with the tooltip text and toggle on click', () => {
    render(<InfoTip label="Stack" tip="Vertical distance" id="tip-x" />);
    const button = screen.getByRole('button', { name: 'Stack' });
    expect(button).toHaveAccessibleDescription('Vertical distance');
    expect(screen.getByRole('tooltip')).toHaveClass('hidden');
    fireEvent.click(button);
    expect(screen.getByRole('tooltip')).toHaveClass('block');
    fireEvent.blur(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('MetricTile hint', () => {
  it('should render a plain label without a hint and a tooltip trigger with one', () => {
    const { rerender } = render(<MetricTile label="Reach" value={384} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    rerender(<MetricTile label="Reach" value={384} hint={{ id: 'tip-r', text: 'Horizontal distance' }} />);
    expect(screen.getByRole('button', { name: 'Reach' })).toHaveAccessibleDescription('Horizontal distance');
  });
});

describe('Toast', () => {
  it('should be a polite status for success and an alert for failure and call the dismiss handler', () => {
    const onDismiss = vi.fn();
    const { rerender } = render(<Toast tone="success" title="Saved" detail="Saddle 742 mm" dismissLabel="Close" onDismiss={onDismiss} />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Saddle 742 mm')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Close'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    rerender(<Toast tone="danger" title="Failed" dismissLabel="Close" onDismiss={onDismiss} />);
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
  });
});
