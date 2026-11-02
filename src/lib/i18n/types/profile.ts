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

/** The garage of the profile page: the rider's bikes, which one is active and what the last diagnosis showed. */
export interface GarageTexts {
  kindLabel: string;
  trainerLabel: string;
  trainerHint: string;
  title: string;
  intro: string;
  active: string;
  factory: string;
  ownSetup: string;
  unnamed: string;
  yearSize: string;
  lastDiagnosis: string;
  /** The label of the setup row and of the year and size row on a bike card. */
  setupLabel: string;
  yearSizeLabel: string;
  never: string;
  saddleBack: string;
  saddleForward: string;
  saddleKeep: string;
  spacerAdd: string;
  spacerRemove: string;
  spacerKeep: string;
  makeActive: string;
  audit: string;
  editSetup: string;
  add: string;
  dialogTitle: string;
  dialogIntro: string;
  dialogYourBikes: string;
  dialogAddTitle: string;
  dialogClose: string;
  nameLabel: string;
  namePlaceholder: string;
  create: string;
  cancel: string;
  nameInvalid: string;
  full: string;
  failed: string;
  rename: string;
  save: string;
  remove: string;
  confirmRemove: string;
  removeActiveHint: string;
  removeOnlyHint: string;
}

export interface ProfileTexts {
  title: string;
  subtitle: string;
  backToProfile: string;
  garage: GarageTexts;
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
  /** The three tabs of the page and what they hold (Epic 44). */
  tabs: { label: string; riders: string; numbers: string; account: string };
  body: { bikesTab: string; bodyTab: string; notActive: string; makeActive: string; setupLine: string };
  numbers: { openReport: string; stack: string; reach: string };
  settings: { title: string };
  rights: {
    title: string;
    intro: string;
    export: { button: string; hint: string; empty: string; error: string };
    erase: ConfirmTexts & { done: string };
    deleteAccount: ConfirmTexts;
  };
}
