import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { Toast } from '@/components/primitives/Toast';
import type { BikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import type { SaveStatus } from '@/lib/hooks/useRiderProfile';

interface SaveToastProps {
  t: Translations;
  status: SaveStatus | null;
  coordinates: BikeFitCoordinates;
  onDismiss: () => void;
}

/** Confirmation of "Save Coordinates to Profile": lists the stored XY values, or reports that storage failed. */
export const SaveToast: React.FC<SaveToastProps> = ({ t, status, coordinates, onDismiss }) => {
  if (!status) return null;
  if (status === 'error') {
    return <Toast tone="danger" title={t.studio.saveFailed} dismissLabel={t.studio.toastDismiss} onDismiss={onDismiss} />;
  }
  const detail = fill(t.studio.toastDetail, {
    height: coordinates.saddle.heightAlongTubeMm,
    setback: coordinates.saddle.setbackXMm,
    stack: coordinates.cockpit.stackYMm,
    reach: coordinates.cockpit.reachXMm,
  });
  return <Toast tone="success" title={t.studio.savedToProfile} detail={detail} dismissLabel={t.studio.toastDismiss} onDismiss={onDismiss} />;
};
