/** Texts of the "My profile" page: what is stored about the rider, what was calculated and the rider's data rights (English primary, Czech secondary). */
export interface ConfirmTexts {
  button: string;
  hint: string;
  confirmTitle: string;
  confirmBody: string;
  confirm: string;
  cancel: string;
  working: string;
  error: string;
}

export interface ProfileTexts {
  title: string;
  subtitle: string;
  backToProfile: string;
  account: {
    title: string;
    email: string;
    method: string;
    methods: { google: string; email: string; other: string };
    created: string;
    lastSaved: string;
    neverSaved: string;
    loading: string;
    readError: string;
  };
  entered: {
    title: string;
    intro: string;
    change: string;
    groups: { discipline: string; body: string; posture: string; bike: string };
    style: string;
    symptoms: string;
    symptomsNone: string;
    healthTag: string;
    saddleHeight: string;
    barWidth: string;
    crank: string;
    factorySetup: string;
    factoryNone: string;
    notEntered: string;
    optional: { footLengthMm: string; footWidthMm: string; chestCircumferenceCm: string; waistCircumferenceCm: string };
  };
  calculated: { title: string; intro: string; kbVersion: string; locked: string };
  rights: {
    title: string;
    intro: string;
    export: { button: string; hint: string; empty: string; error: string };
    erase: ConfirmTexts & { done: string };
    deleteAccount: ConfirmTexts;
  };
}
