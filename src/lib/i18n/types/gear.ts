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
  steps: Record<'product' | 'parameters' | 'answers' | 'insight' | 'prompt', string>;
  stepHelp: Record<'product' | 'parameters' | 'answers' | 'insight' | 'prompt', string>;
  howItWorks: { title: string; intro: string; items: [{ title: string; body: string }, { title: string; body: string }, { title: string; body: string }]; notShop: string; exampleShow: string; exampleHide: string; example: string[] };
  product: { label: string; placeholder: string; find: string; popular: string; browse: string; hideBrowse: string; aiNote: string; tooShort: string };
  budget: { label: string; hint: string; placeholder: string; currencyLabel: string };
  notes: { label: string; hint: string; placeholder: string };
  brands: { preferred: string; avoid: string; preferredValue: string; avoidValue: string };
  picker: { retry: string; groupKb: string; groupSuggested: string; groupMore: string; groupOwn: string; moreShow: string; moreHide: string; recommended: string; title: string; intro: string; loading: string; selected: string; start: string; reset: string; remove: string; addTitle: string; addHint: string; addPlaceholder: string; add: string; fromKb: string; select: string; fallback: string; outOfScope: string; rateLimited: string };
  ownAnswer: string;
  /** Under the hint of a question with options: several may be chosen. */
  chooseMore: string;
  groups: Record<GearGroupId, string>;
  categories: Record<GearCategoryId, string>;
  categoryIntro: string;
  answersIntro: string;
  params: Record<GearParamId, { label: string; hint: string }>;
  options: { [P in ChoiceParamId]: Record<(typeof GEAR_OPTIONS)[P][number], string> };
  fromGarage: string;
  clear: string;
  insight: { title: string; intro: string; none: string; source: string };
  prompt: { title: string; intro: string; open: string; summaryTitle: string; noAnswers: string };
  /** The purchases the rider saved: "Save and close" and the list on the start page. */
  saved: {
    title: string;
    openTitle: string;
    doneTitle: string;
    limit: string;
    saveClose: string;
    savedNotice: string;
    full: string;
    untitled: string;
    stepOf: string;
    answered: string;
    updated: string;
    continue: string;
    reopen: string;
    markDone: string;
    delete: string;
    confirmDelete: string;
    yes: string;
    no: string;
  };
  /** The guide on the last page: what to do with the master prompt, by chatbot, and how to read the answer. */
  useGuide: {
    title: string;
    intro: string;
    platformLabel: string;
    platforms: Record<'chatgpt' | 'claude' | 'gemini' | 'perplexity', { name: string; url: string; steps: [string, string, string] }>;
    open: string;
    afterTitle: string;
    after: [string, string, string, string];
    privacy: string;
  };
  modal: { title: string; intro: string; includeBike: string; includeRider: string; includeRiderNamed: string; privacy: string; preview: string; copy: string; copied: string; failed: string; close: string; size: string };
}

/** The knowledge the master prompt carries (the rules of the KB with their sources) and the words of the prompt itself. */
export interface GearKbTexts {
  insights: Record<GearInsightId, GearInsightTexts>;
  prompt: {
    role: string;
    mission: string;
    headings: Record<'role' | 'mission' | 'category' | 'rider' | 'bike' | 'answers' | 'notes' | 'knowledge' | 'guardrails' | 'task' | 'format', string>;
    labels: { height: string; weight: string; inseam: string; acromion: string; discipline: string; crank: string; barWidth: string; speeds: string; system: string; trainer: string; yes: string; no: string };
    undecided: string;
    riderHidden: string;
    bikeHidden: string;
    noKnowledge: string;
    guardrails: string[];
    task: string[];
    format: string[];
  };
}
