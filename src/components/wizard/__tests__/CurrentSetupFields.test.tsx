import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { CurrentSetupFields } from '../CurrentSetupFields';

const LOCALES: Locale[] = ['en', 'cs'];

function renderFields(locale: Locale, overrides: Record<string, unknown> = {}) {
  const handlers = {
    setCrankLengthMm: vi.fn(), setCurrentSaddleHeightMm: vi.fn(), setCurrentBarWidthMm: vi.fn(), onOpenGuide: vi.fn(),
  };
  const props = {
    t: translations[locale], crankLengthMm: 170, currentSaddleHeightMm: null, currentBarWidthMm: null, inseamMm: 840,
    ...handlers, ...overrides,
  };
  return { ...render(<CurrentSetupFields {...props} />), ...handlers, t: props.t };
}

describe.each(LOCALES)('CurrentSetupFields (%s)', (locale) => {
  it('should render the section with the CURRENT labels of the selected language only', () => {
    const { t, asFragment } = renderFields(locale);
    expect(screen.getByText(t.wizard.currentCrankLabel)).toBeInTheDocument();
    expect(screen.getByText(t.wizard.currentSaddleLabel)).toBeInTheDocument();
    expect(screen.getByText(t.wizard.currentBarLabel)).toBeInTheDocument();
    const other = locale === 'en' ? translations.cs : translations.en;
    expect(screen.queryByText(other.wizard.currentCrankLabel)).not.toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it('should offer the crank presets and report the selected length', () => {
    const view = renderFields(locale);
    for (const preset of ['160', '165', '170', '172.5', '175']) {
      expect(screen.getByText(`${preset}mm`)).toBeInTheDocument();
    }
    fireEvent.click(screen.getByText('175mm'));
    expect(view.setCrankLengthMm).toHaveBeenCalledWith(175);
  });

  it('should show the not set chip for missing values and the entered value otherwise', () => {
    const { t, unmount } = renderFields(locale);
    expect(screen.getAllByText(t.wizard.notSetChip)).toHaveLength(2);
    unmount();
    renderFields(locale, { currentSaddleHeightMm: 742, currentBarWidthMm: 400 });
    expect(screen.getByText('742 mm')).toBeInTheDocument();
    expect(screen.getByText('400 mm')).toBeInTheDocument();
  });

  it('should set the profile value on the first slider interaction and allow clearing it', () => {
    const view = renderFields(locale, { currentSaddleHeightMm: 742 });
    fireEvent.change(screen.getByLabelText(view.t.wizard.currentSaddleLabel), { target: { value: '750' } });
    expect(view.setCurrentSaddleHeightMm).toHaveBeenCalledWith(750);
    fireEvent.change(screen.getByLabelText(view.t.wizard.currentBarLabel), { target: { value: '400' } });
    expect(view.setCurrentBarWidthMm).toHaveBeenCalledWith(400);
    fireEvent.click(screen.getByText(view.t.wizard.clearValue));
    expect(view.setCurrentSaddleHeightMm).toHaveBeenLastCalledWith(null);
  });

  it('should start the saddle slider at the LeMond target and the bar slider at 420 mm when not entered', () => {
    const view = renderFields(locale);
    expect(screen.getByLabelText(view.t.wizard.currentSaddleLabel)).toHaveValue('742');
    expect(screen.getByLabelText(view.t.wizard.currentBarLabel)).toHaveValue('420');
  });

  it('should keep the slider ranges of the specification', () => {
    const view = renderFields(locale);
    const saddle = screen.getByLabelText(view.t.wizard.currentSaddleLabel);
    const bar = screen.getByLabelText(view.t.wizard.currentBarLabel);
    expect([saddle.getAttribute('min'), saddle.getAttribute('max')]).toEqual(['600', '900']);
    expect([bar.getAttribute('min'), bar.getAttribute('max')]).toEqual(['340', '460']);
  });

  it('should open the matching guide from each help link', () => {
    const view = renderFields(locale);
    fireEvent.click(screen.getByTestId('crank-guide-trigger'));
    fireEvent.click(screen.getByTestId('saddle-guide-trigger'));
    fireEvent.click(screen.getByTestId('bar-guide-trigger'));
    expect(view.onOpenGuide.mock.calls).toEqual([['crank'], ['saddleHeight'], ['barWidth']]);
    expect(screen.getByText(view.t.wizard.currentCrankLink)).toBeInTheDocument();
  });
});
