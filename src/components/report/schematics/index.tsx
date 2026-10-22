import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { assessBar, assessCrank } from '@/lib/engines/baikfit/advice';
import type { Finding, FindingInput } from '../reportFindings';
import { BarSchematic } from './BarSchematic';
import { CrankSchematic } from './CrankSchematic';
import { PitchCleatSchematic } from './PitchCleatSchematic';
import { SaddleSchematic } from './SaddleSchematic';

/** The schematic that belongs to a report finding, drawn from the same rider data and KB rules as the finding. */
export function schematicFor(id: Finding['id'], t: Translations, input: FindingInput): React.ReactNode {
  const texts = t.diagnosticReport.schematics;
  switch (id) {
    case 'saddle':
      return <SaddleSchematic t={texts} targetMm={input.saddleHeightMm} currentMm={input.currentSaddleHeightMm} />;
    case 'handlebar':
      return <BarSchematic t={texts} acromionMm={input.acromionWidthMm} bar={assessBar(input.currentBarWidthMm, input.acromionWidthMm)} />;
    case 'pitchCleat':
      return <PitchCleatSchematic t={texts} />;
    default:
      return <CrankSchematic t={texts} crank={assessCrank(input.crankLengthMm)} />;
  }
}
