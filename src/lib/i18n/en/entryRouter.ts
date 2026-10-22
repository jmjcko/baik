import type { Translations } from '../types';

export const entryRouter: Translations['entryRouter'] = {
  title: 'Find Your Perfect Bike Fit',
  subtitle: 'Simple guide to bike setup and choosing the right size from home.',
  pathATitle: 'Tune My Current Bike',
  pathASubtitle: 'Hands, knees, or back hurt while riding? We will guide you through 3 quick steps to show precise fit adjustments.',
  pathABadge: 'PATH A: GUIDED FIT',
  pathAButton: 'Start Fit Guide →',
  pathASteps: [
    'Measure your body (3 minutes)',
    'Pain diagnostics & fit calculation',
    'Clear report with instructions on what to adjust',
  ],
  pathBTitle: 'Check a New Bike Before Buying',
  pathBSubtitle: "Planning to buy a new bike? We'll match your body with frame geometry so you don't buy the wrong size.",
  pathBBadge: 'PATH B: PRE-PURCHASE AUDIT',
  pathBButton: 'Check New Bike →',
  pathBSteps: [
    'Enter model name or bike link',
    'AI geometry check (Stack / Reach)',
    'Alerts on mismatched handlebars or cranks before ordering',
  ],
  directCadTitle: 'Direct Studio Access',
  directCadSubtitle: 'For experienced fitters and frame builders seeking instantaneous coordinate adjustments.',
  directCadButton: 'Open CAD Studio Directly (Advanced)',
};
