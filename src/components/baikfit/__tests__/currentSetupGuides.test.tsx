import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { GUIDES, GUIDE_STEPS, GUIDE_TEXT_KEYS } from '../guides';
import { MeasurementGuideModal } from '../MeasurementGuideModal';

const NEW_GUIDES = [
  { type: 'crank', testId: 'crank-cad-vector', image: 'crank_cad.svg', stepsKey: 'crankSteps' },
  { type: 'saddleHeight', testId: 'saddle-cad-vector', image: 'saddle_cad.svg', stepsKey: 'saddleSteps' },
  { type: 'barWidth', testId: 'bar-cad-vector', image: 'bar_cad.svg', stepsKey: 'barSteps' },
] as const;

describe.each(['en', 'cs'] as const)('current setup guides (%s)', (locale: Locale) => {
  const t = translations[locale];

  it.each(NEW_GUIDES)('should render the $type guide with image, overlay, three steps and a clinical note', ({ type, testId, image }) => {
    const { container } = render(<MeasurementGuideModal isOpen onClose={vi.fn()} guideType={type} t={t} />);
    expect(screen.getByTestId(testId)).toBeInTheDocument();
    expect(container.querySelector(`img[src^="/assets/guides/${image}"]`)).not.toBeNull();
    expect(t.wizard[GUIDE_STEPS[type]]).toHaveLength(3);
    for (const step of t.wizard[GUIDE_STEPS[type]]) expect(screen.getByText(step)).toBeInTheDocument();
    expect(screen.getByText(t.wizard[GUIDE_TEXT_KEYS[type].clinicalNote])).toBeInTheDocument();
  });

  it('should take every overlay text from the translations', () => {
    for (const { type } of NEW_GUIDES) {
      for (const element of GUIDES[type].elements) {
        if (element.type === 'text') expect(t.wizard[element.textKey], `${type}:${element.textKey}`).toBeTruthy();
      }
    }
  });
});

describe('guide content', () => {
  it('should describe the crank stamp, the fallback measurement and the saddle 70 mm point', () => {
    const en = translations.en.wizard;
    expect(en.crankSteps.join(' ')).toMatch(/inside face of the crank arm/i);
    expect(en.crankSteps.join(' ')).toMatch(/center of the pedal spindle/i);
    expect(en.saddleSteps.join(' ')).toMatch(/70 mm/);
    expect(en.barSteps.join(' ')).toMatch(/center to center/i);
  });

  it('should use the Czech wording for the same facts', () => {
    const cs = translations.cs.wizard;
    expect(cs.crankSteps.join(' ')).toMatch(/vnitřní stranu ramene kliky/i);
    expect(cs.saddleSteps.join(' ')).toMatch(/70 mm/);
    expect(cs.barSteps.join(' ')).toMatch(/osa k ose/i);
  });
});
