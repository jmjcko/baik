import { acromionGuide } from './acromion';
import { armGuide } from './arm';
import { barWidthGuide } from './barWidth';
import { crankGuide } from './crank';
import { inseamGuide } from './inseam';
import { saddleHeightGuide } from './saddleHeight';
import { torsoGuide } from './torso';
import type { GuideConfig, GuideTextKeys, GuideType } from './types';

export type { GuideConfig, GuideType } from './types';

export const GUIDES: Record<GuideType, GuideConfig> = {
  inseam: inseamGuide,
  torso: torsoGuide,
  acromion: acromionGuide,
  arm: armGuide,
  crank: crankGuide,
  saddleHeight: saddleHeightGuide,
  barWidth: barWidthGuide,
};

export const GUIDE_TEXT_KEYS: Record<GuideType, GuideTextKeys> = {
  inseam: { title: 'inseamGuideTitle', clinicalNote: 'inseamClinicalNote' },
  torso: { title: 'torsoAccordionTitle', clinicalNote: 'torsoClinicalNote' },
  acromion: { title: 'acromionGuideTitle', clinicalNote: 'acromionClinicalNote', intro: 'acromionGuideText' },
  arm: { title: 'armGuideTitle', clinicalNote: 'armClinicalNote', intro: 'armGuideText' },
  crank: { title: 'crankGuideTitle', clinicalNote: 'crankClinicalNote', intro: 'crankGuideText' },
  saddleHeight: { title: 'saddleGuideTitle', clinicalNote: 'saddleClinicalNote', intro: 'saddleGuideText' },
  barWidth: { title: 'barGuideTitle', clinicalNote: 'barClinicalNote', intro: 'barGuideText' },
};

type StepsKey = 'inseamSteps' | 'torsoSteps' | 'acromionSteps' | 'armSteps' | 'crankSteps' | 'saddleSteps' | 'barSteps';

export const GUIDE_STEPS: Record<GuideType, StepsKey> = {
  inseam: 'inseamSteps',
  torso: 'torsoSteps',
  acromion: 'acromionSteps',
  arm: 'armSteps',
  crank: 'crankSteps',
  saddleHeight: 'saddleSteps',
  barWidth: 'barSteps',
};
