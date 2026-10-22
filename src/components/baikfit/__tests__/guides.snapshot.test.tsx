import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { MeasurementGuideModal } from '../MeasurementGuideModal';
import { MorphologyWizardStep } from '../MorphologyWizardStep';

const LOCALES: Locale[] = ['en', 'cs'];
const GUIDES = ['inseam', 'torso', 'acromion', 'arm', 'crank', 'saddleHeight', 'barWidth'] as const;

describe.each(LOCALES)('measurement guides and step snapshots (%s)', (locale) => {
  const t = translations[locale];

  it.each(GUIDES)('should render the %s guide modal', (guideType) => {
    const { asFragment } = render(<MeasurementGuideModal isOpen onClose={vi.fn()} guideType={guideType} t={t} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render the morphology step with a valid and an invalid inseam', () => {
    const props = {
      t, inseamMm: 840, setInseamMm: vi.fn(), torsoLengthMm: 620, setTorsoLengthMm: vi.fn(),
      acromionWidthMm: 420, setAcromionWidthMm: vi.fn(), heightCm: 178, setHeightCm: vi.fn(),
      armLengthMm: 620, setArmLengthMm: vi.fn(), ridingStyle: 'race' as const, setRidingStyle: vi.fn(),
    };
    const valid = render(<MorphologyWizardStep {...props} />);
    expect(valid.asFragment()).toMatchSnapshot();
    valid.unmount();
    expect(render(<MorphologyWizardStep {...props} inseamMm={450} />).asFragment()).toMatchSnapshot();
  });
});
