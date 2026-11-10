/** What a rider can agree to. One row per purpose; every purpose is asked for itself, never bundled. */
export const CONSENT_PURPOSES = ['health_storage', 'ai_processing', 'strava', 'intervals', 'analytics'] as const;

export type ConsentPurpose = (typeof CONSENT_PURPOSES)[number];

/**
 * The version of the text that is shown for each purpose (intervals: 3 since the daily load without an open app, story 56.2a; 2 since the key is kept encrypted in the account, story 56.1). A rider who agreed to an older version is asked again, so the record always
 * tells which words were agreed to. Raise the number of a purpose when its text (or the data it covers) changes.
 */
export const CONSENT_TEXT_VERSION: Record<ConsentPurpose, number> = {
  health_storage: 1,
  ai_processing: 1,
  strava: 1,
  intervals: 3,
  analytics: 1,
};

export const isConsentPurpose = (value: unknown): value is ConsentPurpose => (CONSENT_PURPOSES as readonly unknown[]).includes(value);

/**
 * The controller of the data, as shown on the privacy page. The name is the working name of the product (it changes with the brand);
 * the contact is left open until the product owner fills it in, and the page then shows the placeholder text of the dictionary.
 */
export const CONTROLLER = {
  name: 'bAIk',
  contact: process.env.NEXT_PUBLIC_PRIVACY_CONTACT?.trim() || null,
} as const;
