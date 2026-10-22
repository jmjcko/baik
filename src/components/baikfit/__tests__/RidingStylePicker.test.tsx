import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { translations } from '@/lib/i18n/translations';
import { RidingStylePicker } from '../RidingStylePicker';

describe.each(['en', 'cs'] as const)('RidingStylePicker (%s)', (locale) => {
  const t = translations[locale];

  it('should show one silhouette with its back angle tag per style', () => {
    const { container } = render(<RidingStylePicker t={t} value="balanced" onChange={vi.fn()} />);
    expect(container.querySelectorAll('svg[data-testid^="posture-silhouette-"]')).toHaveLength(3);
    expect(screen.getByTestId('posture-silhouette-endurance')).toHaveTextContent('45°+');
    expect(screen.getByTestId('posture-silhouette-balanced')).toHaveTextContent('35–42°');
    expect(screen.getByTestId('posture-silhouette-race')).toHaveTextContent('25–32°');
  });

  it('should hide the decorative silhouettes from assistive technology and select a style', () => {
    const onChange = vi.fn();
    render(<RidingStylePicker t={t} value="balanced" onChange={onChange} />);
    expect(screen.getByTestId('posture-silhouette-race')).toHaveAttribute('aria-hidden', 'true');
    fireEvent.click(screen.getByText(t.wizard.ridingStyleEnduranceTitle));
    expect(onChange).toHaveBeenCalledWith('endurance');
  });
});
