/** Texts of the navigation screen domain (English primary, Czech secondary; parity enforced by the types). */
export interface NavigationTexts {
  studio: string;
  workshop: string;
  shop: string;
  docs: string;
  baikfitEngine: string;
  baikcareStudio: string;
  baikshopAdvisory: string;
  comingSoon: string;
  themeDark: string;
  themeLight: string;
  languageLabel: string;
  themeLabel: string;
  guestLabel: string;
  signInSoon: string;
  myProfile: string;
  capabilities: string;
  journeyTitle: string;
  journeyLocked: string;
  journeySteps: Record<'discipline' | 'body' | 'posture' | 'bike' | 'report', string>;
}
