import type { Translations } from '../types';

export const shell: Translations['shell'] = {
  header: {
    modes: { entry: 'Dashboard', fit: 'bAIkfit', wizard: 'Setup guide', report: 'Fit report', studio: 'CAD studio', prepurchasing: 'Pre-purchase check', profile: 'My profile', admin: 'Catalog admin', capabilities: 'Fitting capabilities' },
    activeBike: 'Active bike',
    bikeSwitcherLabel: 'Active bike of your garage',
    noBike: 'Bike without a name',
    openNav: 'Open the navigation',
    closeNav: 'Close the navigation',
    status: { guest: 'Guest: saved in this browser', synced: 'Signed in: synced', syncing: 'Syncing', error: 'Sync error: kept in this browser' },
  },
  sidebar: {
    dashboard: 'Dashboard',
    modules: 'Modules',
    myBikes: 'My bikes',
    activeBike: 'Active',
    noBikes: 'No bike yet',
    addBike: 'Add a bike',
    mainLabel: 'Main navigation',
  },
  fitHub: {
    title: 'Your bike, fitted to you',
    subtitle: 'Measure yourself, check your bike and get a clear plan of what to change and why, so you ride longer and without pain.',
    chips: ['Exact numbers in millimeters', 'A reason for every step', 'From home, in minutes'],
    pathA: { badge: 'Guided fit', title: 'Tune my current bike', text: 'Hands, knees or back hurt while riding? Get the exact adjustments and the reason for each.', button: 'Start the setup guide' },
    pathB: { badge: 'Before you buy', title: 'Check a new bike', text: 'Match the geometry of a bike you are considering with your body, so you do not buy the wrong size.', button: 'Check a new bike' },
  },
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Your fit at a glance: the targets of your active bike, your garage and your mobility tests.',
    notSetUp: 'Not set up yet',
    kpis: { saddle: 'Target saddle height', stack: 'Target handlebar stack', setback: 'Target saddle setback', symptoms: 'Reported symptoms', diagnosis: 'Last diagnosis' },
    symptomsNone: 'None reported',
    noDiagnosis: 'No diagnosis yet',
    hero: { title: 'Fit your bike to your body', text: 'Answer a few questions, take your measurements and get a report that tells you what to change on your bike and why.', stepsTitle: 'What the setup guide covers', start: 'Start the setup guide', checkBike: 'Check a bike before you buy it' },
    overview: { title: 'Biomechanical overview', subtitle: 'The CAD drawing of your active bike from its target numbers.', empty: 'Finish the setup guide to see the drawing of your bike.' },
    garage: { title: 'My bike garage', text: 'The active bike is the one the setup guide, the report and the studio work with.', active: 'Active bike', makeActive: 'Make active', manage: 'Manage the garage', signInHint: 'Sign in to add more bikes to your garage.', factory: 'Original factory setup', ownSetup: 'Own setup' },
    miniTests: { title: 'Mobility mini-tests', text: 'Two quick tests that adjust your target position to your body.', hamstring: 'Hamstring flexibility', release: 'Hand release test', notDone: 'Not done', take: 'Take the mini-tests', answers: { low: 'Below 60°', medium: '60° to 75°', high: 'Above 75°', slumping: 'Falls forward', stable: 'Holds the position' } },
    modules: { care: { title: 'bAIkcare', text: 'Maintenance protocols and wear diagnostics for your bike.' }, shop: { title: 'bAIkshop', text: 'Component upgrades ranked by what they give you for the money.' }, comingSoon: 'Coming Soon' },
  },
};
