import type { ReportIllustrationId } from '@/components/illustrations/illustrations';
import type { CapabilityPlane, CapabilityStatus } from '@/lib/i18n/types/capabilities';

export interface Capability {
  /** The key of the texts (`capabilities.items`). */
  id: string;
  plane: CapabilityPlane;
  status: CapabilityStatus;
  /** An illustration of the owner that explains the parameter (shown closed). */
  illustration?: ReportIllustrationId;
}

export const CAPABILITY_PLANES: readonly CapabilityPlane[] = ['feet', 'saddle', 'cockpit', 'cranks'];

/**
 * The 20 fitting parameters of the four contact planes (docs/knowledge/epic-26-capabilities-and-minitests.md). The status of
 * each one is the app's assignment, for the product owner to correct: "calculated" means that the engine gives a number in
 * mm or degrees, "educational" a guide only, "clinical" a link to the symptom diagnostics, "interactive" a test of the rider.
 */
export const CAPABILITIES: readonly Capability[] = [
  { id: 'cleatSetback', plane: 'feet', status: 'calculated' },
  { id: 'stance', plane: 'feet', status: 'educational' },
  { id: 'cleatFloat', plane: 'feet', status: 'educational' },
  { id: 'shoeWidth', plane: 'feet', status: 'educational' },
  { id: 'insoles', plane: 'feet', status: 'educational' },
  { id: 'saddleHeight', plane: 'saddle', status: 'calculated' },
  { id: 'setback', plane: 'saddle', status: 'calculated' },
  { id: 'tilt', plane: 'saddle', status: 'calculated' },
  { id: 'cutout', plane: 'saddle', status: 'clinical' },
  { id: 'saddleWidth', plane: 'saddle', status: 'educational' },
  { id: 'barWidth', plane: 'cockpit', status: 'calculated', illustration: 'acromion' },
  { id: 'dropStack', plane: 'cockpit', status: 'calculated', illustration: 'drop' },
  { id: 'reach', plane: 'cockpit', status: 'calculated' },
  { id: 'leverRotation', plane: 'cockpit', status: 'educational' },
  { id: 'leverReach', plane: 'cockpit', status: 'educational' },
  { id: 'crankLength', plane: 'cranks', status: 'calculated' },
  { id: 'diagnostics', plane: 'cranks', status: 'clinical' },
  { id: 'stockAudit', plane: 'cranks', status: 'calculated' },
  { id: 'tirePressure', plane: 'cranks', status: 'educational' },
  { id: 'miniTests', plane: 'cranks', status: 'interactive' },
];
