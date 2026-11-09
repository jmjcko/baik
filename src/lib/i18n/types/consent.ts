import type { ConsentPurpose } from '@/lib/consent/purposes';

/** What one purpose means for the rider: a title, what happens and which data is concerned. */
export interface ConsentPurposeTexts {
  title: string;
  body: string;
  /** The data that the purpose covers, one short item each. */
  data: string[];
}

export interface PrivacySection {
  heading: string;
  paragraphs: string[];
}

/** Texts of the consents and of the privacy page (English primary, Czech secondary). The privacy text is a draft for a legal review. */
export interface ConsentTexts {
  purposes: Record<ConsentPurpose, ConsentPurposeTexts>;
  prompt: {
    dataTitle: string;
    allow: string;
    decline: string;
    privacyLink: string;
    /** Shown when a flow cannot work without the consent (the finder). */
    needed: string;
  };
  /** The pre-purchase audit: the AI part is optional, the rules always run. */
  audit: { title: string; allow: string; decline: string; declinedNote: string };
  finder: { title: string };
  section: {
    title: string;
    intro: string;
    stateGranted: string;
    stateDeclined: string;
    stateUnknown: string;
    give: string;
    withdraw: string;
    withdrawHealthNote: string;
    privacyLink: string;
  };
  privacy: {
    title: string;
    subtitle: string;
    draftNote: string;
    updated: string;
    back: string;
    controllerHeading: string;
    controllerLine: string;
    contactLine: string;
    contactMissing: string;
    sections: PrivacySection[];
  };
}
