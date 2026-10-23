/** The two mobility mini-tests of wizard step 3 (Epic 26): the hamstring test and the hand release test. */
export interface MiniTestOption {
  title: string;
  hint: string;
  /** What the answer changes in the target position (a sentence with the numbers filled in). */
  effect: string;
}

export interface MiniTestCard<Answer extends string> {
  title: string;
  steps: string[];
  question: string;
  options: Record<Answer, MiniTestOption>;
  diagramLabel: string;
  diagramCaption: string;
}

export interface MiniTestsTexts {
  title: string;
  intro: string;
  optional: string;
  clear: string;
  hamstring: MiniTestCard<'low' | 'medium' | 'high'>;
  release: MiniTestCard<'slumping' | 'stable'>;
}
