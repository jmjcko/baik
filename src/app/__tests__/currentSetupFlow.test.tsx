import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HomePage from '../page';
import { translations } from '@/lib/i18n/translations';
import { RIDER_PROFILE_STORAGE_KEY } from '@/lib/engines/baikfit/coordinates';

const t = translations.en;

function openStep2() {
  fireEvent.click(screen.getByText(t.entryRouter.pathAButton));
  fireEvent.click(screen.getByText(t.wizard.toPainButton));
}

describe('Tune My Current Bike: current setup flow', () => {
  beforeEach(() => localStorage.clear());

  it('should carry the entered saddle height and handlebar width into the report', () => {
    render(<HomePage />);
    openStep2();
    fireEvent.change(screen.getByLabelText(t.wizard.currentSaddleLabel), { target: { value: '760' } });
    fireEvent.change(screen.getByLabelText(t.wizard.currentBarLabel), { target: { value: '440' } });
    fireEvent.click(screen.getByText(t.wizard.toReportButton));
    expect(screen.getByText(/Lower it toward the target/)).toBeInTheDocument();
    expect(screen.getByText(/Your 440 mm handlebars/)).toBeInTheDocument();
  });

  it('should persist the current setup in the stored profile and restore it after a reload', () => {
    const first = render(<HomePage />);
    openStep2();
    fireEvent.change(screen.getByLabelText(t.wizard.currentSaddleLabel), { target: { value: '755' } });
    const stored = JSON.parse(localStorage.getItem(RIDER_PROFILE_STORAGE_KEY) ?? '{}');
    expect(stored.currentSaddleHeightMm).toBe(755);
    expect(stored.currentBarWidthMm).toBeNull();
    first.unmount();
    render(<HomePage />);
    openStep2();
    expect(screen.getByText('755 mm')).toBeInTheDocument();
  });

  it('should open the three help guides from step 2 and close them', () => {
    render(<HomePage />);
    openStep2();
    for (const [trigger, vector] of [['crank-guide-trigger', 'crank-cad-vector'], ['saddle-guide-trigger', 'saddle-cad-vector'], ['bar-guide-trigger', 'bar-cad-vector']]) {
      fireEvent.click(screen.getByTestId(trigger));
      expect(screen.getByTestId(vector)).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('modal-close-btn'));
    }
  });
});
