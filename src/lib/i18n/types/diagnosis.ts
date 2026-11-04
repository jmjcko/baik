/** Texts of the diagnosis screen domain (English primary, Czech secondary; parity enforced by the types). */
/** One row of the master KB clinical decision tree: symptom, root cause and ordered fixes. */
export interface DiagnosisText {
  title: string;
  rootCause: string;
  fixes: string[];
  /** The Balance Test with its limits; not shown to a rider who reports pain at the back of the knee (the saddle is never moved back for that rider). */
  balanceTest?: string;
}

export interface DiagnosisTexts {
  heading: string;
  noSymptoms: string;
  rootCauseLabel: string;
  fixesLabel: string;
  learnMore: string;
  items: Record<'ulnar' | 'median' | 'anteriorKnee' | 'posteriorKnee' | 'lowerBack' | 'neck' | 'saddlePressure' | 'legLength' | 'armPump', DiagnosisText>;
}
