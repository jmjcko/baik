import type { ChoiceParamId, GearCategoryId, GearGroupId, GearInsightId, GearParamId, GEAR_OPTIONS } from '@/types/gearTypes';

export interface GearInsightTexts {
  title: string;
  body: string;
  /** Where the rule is in the knowledge bases, e.g. "KB bAIkshop 1.2". */
  source: string;
}

/** The bAIkgear page (Epic 41): the survey wizard, its questions and the dialog with the master prompt. */
export interface GearTexts {
  title: string;
  subtitle: string;
  back: string;
  next: string;
  previous: string;
  stepOf: string;
  steps: Record<'category' | 'survey' | 'insight' | 'prompt', string>;
  groups: Record<GearGroupId, string>;
  categories: Record<GearCategoryId, string>;
  categoryIntro: string;
  surveyIntro: string;
  deepNote: string;
  generalNote: string;
  params: Record<GearParamId, { label: string; hint: string }>;
  options: { [P in ChoiceParamId]: Record<(typeof GEAR_OPTIONS)[P][number], string> };
  fromGarage: string;
  clear: string;
  insight: { title: string; intro: string; none: string; source: string };
  prompt: { title: string; intro: string; open: string; summaryTitle: string; noAnswers: string };
  modal: { title: string; intro: string; includeBike: string; includeRider: string; privacy: string; preview: string; copy: string; copied: string; failed: string; close: string; size: string };
}

/** The knowledge the master prompt carries (the rules of the KB with their sources) and the words of the prompt itself. */
export interface GearKbTexts {
  insights: Record<GearInsightId, GearInsightTexts>;
  prompt: {
    role: string;
    mission: string;
    headings: Record<'role' | 'mission' | 'category' | 'rider' | 'bike' | 'answers' | 'knowledge' | 'guardrails' | 'task' | 'format', string>;
    labels: { height: string; weight: string; inseam: string; acromion: string; discipline: string; crank: string; barWidth: string; speeds: string; system: string; trainer: string; yes: string; no: string };
    riderHidden: string;
    bikeHidden: string;
    noKnowledge: string;
    guardrails: string[];
    task: string[];
    format: string[];
  };
}
