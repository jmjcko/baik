import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { computeBikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import { StudioMeasured } from '../StudioMeasured';

const coordinates = computeBikeFitCoordinates({ inseamMm: 840, ridingDiscipline: 'road' });

describe.each(['en', 'cs'] as Locale[])('the measured numbers in the studio (%s)', (locale) => {
  const t = translations[locale];

  it('should list every measured number with the target where the KB has one, and mark what was not measured', () => {
    render(<StudioMeasured t={t} coordinates={coordinates} saddleHeightMm={730} barWidthMm={null} crankLengthMm={172.5} custom={{ saddleSetbackMm: 180, stemLengthMm: null, spacerStackMm: 10, saddleToBarDropMm: -5 }} />);
    const rows = within(screen.getByTestId('studio-measured')).getAllByRole('row').slice(1);
    expect(rows).toHaveLength(7);
    expect(rows[0]).toHaveTextContent(`730 mm${coordinates.saddle.heightAlongTubeMm} mm`);
    expect(rows[1]).toHaveTextContent(`180 mm${Math.abs(coordinates.saddle.setbackXMm)} mm`);
    expect(rows[2]).toHaveTextContent(`${t.customSetup.notMeasured}–`);
    expect(rows[5]).toHaveTextContent('-5 mm');
    expect(rows[6]).toHaveTextContent('172.5 mm');
  });
});
