import type { FinderParameterId, PARAMETER_OPTIONS } from '@/lib/finder/parameters';

/** One question: its name, why it matters for the choice, and the words of every option (a text question has none). */
export type FinderParameterTexts = {
  [K in FinderParameterId]: { name: string; why: string; options: Record<(typeof PARAMETER_OPTIONS)[K][number], string> };
};

export interface FinderTexts {
  modeLabel: string;
  modeKnown: string;
  modeFinder: string;
  modeKnownHint: string;
  modeFinderHint: string;
  title: string;
  intro: string;
  categoryLine: string;
  progress: string;
  optional: string;
  textPlaceholder: string;
  back: string;
  next: string;
  skip: string;
  seeResults: string;
  working: string;
  startOver: string;
  editAnswers: string;
  savedNote: string;
  resumed: string;
  resultsTitle: string;
  resultsIntro: string;
  disclaimer: string;
  errors: { invalid_input: string; not_configured: string; rate_limited: string; unavailable: string; unreadable: string };
  card: {
    why: string;
    geometryCatalog: string;
    geometryYours: string;
    geometryMissing: string;
    yearDiffers: string;
    bestSize: string;
    sizeYouPicked: string;
    fit: string;
    deviation: string;
    verdictGood: string;
    verdictChanges: string;
    verdictLow: string;
    trapsTitle: string;
    noTraps: string;
    auditButton: string;
    supplyTitle: string;
    supplyRemove: string;
  };
  parameters: FinderParameterTexts;
}
