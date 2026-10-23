import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HomePage from '../page';
import { translations } from '@/lib/i18n/translations';
import { storedPassport } from '@/test/storedPassport';

const t = translations.en;

function openCurrentBikeStep() {
  fireEvent.click(screen.getByText(t.shell.dashboard.hero.start));
  fireEvent.click(screen.getByText(t.wizard.continueToBody));
  fireEvent.click(screen.getByText(t.wizard.continueToPosture));
  fireEvent.click(screen.getByText(t.wizard.continueToBike));
}

describe('Tune My Current Bike: current setup flow', () => {
  beforeEach(() => localStorage.clear());

  it('should carry the entered saddle height and handlebar width into the report', () => {
    render(<HomePage />);
    openCurrentBikeStep();
    fireEvent.change(screen.getByLabelText(t.wizard.currentSaddleLabel), { target: { value: '760' } });
    fireEvent.change(screen.getByLabelText(t.wizard.currentBarLabel), { target: { value: '440' } });
    fireEvent.click(screen.getByText(t.wizard.toReportButton));
    expect(screen.getByText(/Lower it toward the target/)).toBeInTheDocument();
    expect(screen.getByText(/Your 440 mm handlebars/)).toBeInTheDocument();
  });

  it('should persist the current setup in the stored passport and restore it after a reload', () => {
    const first = render(<HomePage />);
    openCurrentBikeStep();
    fireEvent.change(screen.getByLabelText(t.wizard.currentSaddleLabel), { target: { value: '755' } });
    const current = storedPassport()?.bikes[0];
    expect(current?.kind).toBe('current');
    expect(current?.components?.saddleHeightMm).toBe(755);
    expect(current?.components?.handlebarWidthMm).toBeNull();
    first.unmount();
    render(<HomePage />);
    openCurrentBikeStep();
    expect(screen.getByText('755 mm')).toBeInTheDocument();
  });

  it('should open the three help guides from step 4 and close them', () => {
    render(<HomePage />);
    openCurrentBikeStep();
    for (const [trigger, vector] of [['crank-guide-trigger', 'crank-cad-vector'], ['saddle-guide-trigger', 'saddle-cad-vector'], ['bar-guide-trigger', 'bar-cad-vector']]) {
      fireEvent.click(screen.getByTestId(trigger));
      expect(screen.getByTestId(vector)).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('modal-close-btn'));
    }
  });
});
