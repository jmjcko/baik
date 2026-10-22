import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { translations } from '@/lib/i18n/translations';
import { StudioDiagnosis } from '../StudioDiagnosis';

describe('StudioDiagnosis', () => {
  it('should render nothing without symptoms', () => {
    const { container } = render(<StudioDiagnosis t={translations.en} pains={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it.each(['en', 'cs'] as const)('should list the diagnosis titles in %s', (locale) => {
    const t = translations[locale];
    render(<StudioDiagnosis t={t} pains={['front_knee', 'neck_pain']} />);
    expect(screen.getByTestId('studio-diagnosis')).toHaveTextContent(t.diagnosis.items.anteriorKnee.title);
    expect(screen.getByTestId('studio-diagnosis')).toHaveTextContent(t.diagnosis.items.neck.title);
  });
});
