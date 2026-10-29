export type CustomFieldId = 'saddleHeight' | 'saddleSetback' | 'barWidth' | 'stemLength' | 'spacers' | 'drop' | 'crank';

/** One measured value: the field, the tag in its drawing and the home measuring guide (three steps and what the number changes). */
export interface CustomFieldTexts {
  label: string;
  tag: string;
  hint: string;
  steps: [string, string, string];
  impact: string;
}

/** Step 4 of the wizard for a modified bike, and the plan sentences that come from the measured numbers (Epic 34). */
export interface CustomSetupTexts {
  modeLabel: string;
  modeStock: string;
  modeCustom: string;
  modeStockHint: string;
  modeCustomHint: string;
  title: string;
  subtitle: string;
  guideOpen: string;
  guideClose: string;
  impactLabel: string;
  bbTag: string;
  clear: string;
  notMeasured: string;
  outOfRange: string;
  fields: Record<CustomFieldId, CustomFieldTexts>;
  plan: {
    setbackTitle: string;
    setbackBack: string;
    setbackForward: string;
    estimate: string;
    stemTitle: string;
    stemMtb: string;
    stemRoad: string;
    dropNow: string;
    dropSpacers: string;
  };
  reasons: { setback: string };
  /** The measured numbers as the starting point of the CAD studio. */
  studio: { title: string; subtitle: string; measured: string; target: string };
}
