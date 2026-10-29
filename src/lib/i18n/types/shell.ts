/** The application shell of the Aurora design (Epic 27): the header, the sidebar additions and the dashboard. */
export interface ShellTexts {
  header: {
    modes: Record<'entry' | 'fit' | 'wizard' | 'report' | 'studio' | 'prepurchasing' | 'care' | 'profile' | 'admin' | 'capabilities', string>;
    activeBike: string;
    bikeSwitcherLabel: string;
    noBike: string;
    openNav: string;
    closeNav: string;
    status: { guest: string; synced: string; syncing: string; error: string };
  };
  sidebar: {
    dashboard: string;
    modules: string;
    myBikes: string;
    activeBike: string;
    noBikes: string;
    addBike: string;
    mainLabel: string;
  };
  /** The bAIkfit start page: two tiles, the two ways in (tune my bike, check a bike before buying). */
  fitHub: {
    title: string;
    subtitle: string;
    /** Three short promises under the introduction. */
    chips: string[];
    pathA: { badge: string; title: string; text: string; button: string };
    pathB: { badge: string; title: string; text: string; button: string };
  };
  dashboard: {
    title: string;
    subtitle: string;
    notSetUp: string;
    kpis: { saddle: string; stack: string; setback: string; symptoms: string; diagnosis: string };
    symptomsNone: string;
    noDiagnosis: string;
    hero: { title: string; text: string; stepsTitle: string; start: string; checkBike: string };
    overview: { title: string; subtitle: string; empty: string };
    garage: { title: string; text: string; active: string; makeActive: string; manage: string; signInHint: string; factory: string; ownSetup: string };
    miniTests: { title: string; text: string; hamstring: string; release: string; notDone: string; take: string; answers: Record<'low' | 'medium' | 'high' | 'slumping' | 'stable', string> };
    modules: { care: { title: string; text: string }; shop: { title: string; text: string }; comingSoon: string };
  };
}
