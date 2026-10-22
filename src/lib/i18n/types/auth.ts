/** Texts of the account domain: sign in dialog, account block of the sidebar, offers (English primary, Czech secondary). */
export interface AuthTexts {
  signIn: string;
  signOut: string;
  signedIn: string;
  badge: string;
  title: string;
  tabSignIn: string;
  tabSignUp: string;
  emailLabel: string;
  passwordLabel: string;
  passwordHint: string;
  submitSignIn: string;
  submitSignUp: string;
  magicLink: string;
  google: string;
  orDivider: string;
  working: string;
  close: string;
  consent: string;
  privacyNote: string;
  noticeCheckEmail: string;
  errors: {
    credentials: string;
    consent: string;
    weakPassword: string;
    rateLimited: string;
    network: string;
    notConfigured: string;
    invalidInput: string;
    unknown: string;
  };
  redirect: { ok: string; error: string; dismiss: string };
  merge: { title: string; body: string; deviceTitle: string; accountTitle: string; useDevice: string; keepAccount: string };
  syncError: string;
  offer: { reportTitle: string; reportBody: string; pathBTitle: string; pathBBody: string; signIn: string; notNow: string };
}
