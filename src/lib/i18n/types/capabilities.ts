/** The "Fitting capabilities" page (Epic 26): 20 parameters in 4 contact planes, each with a status badge. */
export type CapabilityPlane = 'feet' | 'saddle' | 'cockpit' | 'cranks';
export type CapabilityStatus = 'calculated' | 'educational' | 'clinical' | 'interactive';

export interface CapabilityItemTexts {
  name: string;
  text: string;
}

export interface CapabilitiesTexts {
  navLabel: string;
  title: string;
  subtitle: string;
  legendTitle: string;
  statuses: Record<CapabilityStatus, { label: string; meaning: string }>;
  planes: Record<CapabilityPlane, { title: string; intro: string }>;
  items: Record<string, CapabilityItemTexts>;
  takeTests: string;
}
