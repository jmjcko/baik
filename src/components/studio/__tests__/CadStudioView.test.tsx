import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { computeBikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import { CadStudioView } from '../CadStudioView';

const LOCALES: Locale[] = ['en', 'cs'];

function renderStudio(locale: Locale, overrides: Record<string, unknown> = {}) {
  const handlers = {
    setInseamMm: vi.fn(), setAcromionWidthMm: vi.fn(), setCrankLengthMm: vi.fn(), setHeightCm: vi.fn(),
    setDiscipline: vi.fn(), setRidingStyle: vi.fn(), togglePain: vi.fn(), onSaveProfile: vi.fn(),
    onBackToReport: vi.fn(), onBackToEntry: vi.fn(), onDismissSaveStatus: vi.fn(),
  };
  const props = {
    t: translations[locale], inseamMm: 840, acromionWidthMm: 390, crankLengthMm: 170, heightCm: 178,
    discipline: 'gravel' as const, ridingStyle: 'race' as const, currentPains: ['numb_hands' as const, 'neck_pain' as const],
    coordinates: computeBikeFitCoordinates({ inseamMm: 840, ridingDiscipline: 'gravel' }), saveStatus: null, ...handlers, ...overrides,
  };
  return { ...render(<CadStudioView {...props} />), ...handlers, t: props.t };
}

describe.each(LOCALES)('CadStudioView (%s)', (locale) => {
  it('should render the studio with active symptoms', () => {
    expect(renderStudio(locale).asFragment()).toMatchSnapshot();
  });

  it('should render an invalid inseam error and the save status', () => {
    const { asFragment } = renderStudio(locale, { inseamMm: 450, saveStatus: 'saved' as const });
    expect(asFragment()).toMatchSnapshot();
  });

  it('should call the handlers of the pickers, symptoms, save and navigation buttons', () => {
    const view = renderStudio(locale);
    fireEvent.click(screen.getByText('165'));
    fireEvent.click(screen.getByText(view.t.studio.disciplines.road.split(' ')[0]));
    fireEvent.click(screen.getByText(view.t.studio.ridingStyles.balanced.split(' ')[0]));
    fireEvent.click(screen.getByText(view.t.studio.pains.front_knee.split('/')[0]));
    fireEvent.click(screen.getByText(view.t.studio.saveButton));
    fireEvent.change(screen.getByLabelText(view.t.studio.inseamLabel), { target: { value: '850' } });
    expect(view.setCrankLengthMm).toHaveBeenCalledWith(165);
    expect(view.setDiscipline).toHaveBeenCalledWith('road');
    expect(view.setRidingStyle).toHaveBeenCalledWith('balanced');
    expect(view.togglePain).toHaveBeenCalledWith('front_knee');
    expect(view.onSaveProfile).toHaveBeenCalledTimes(1);
    expect(view.setInseamMm).toHaveBeenCalledWith(850);
  });

  it('should show the studio diagnosis and the estimate note', () => {
    const { t } = renderStudio(locale);
    expect(screen.getByText(t.studio.estimateNote)).toBeInTheDocument();
    expect(screen.getByTestId('studio-diagnosis')).toHaveTextContent(t.diagnosis.items.neck.title);
  });
});
