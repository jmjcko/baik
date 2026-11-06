'use client';

import { useState } from 'react';

interface Garage {
  bikes: Array<{ id: string; isActive: boolean }>;
}

/**
 * The "Edit bike" dialog of the app: whether it is open, the way to open it for a bike (the bike becomes the active one first), and a counter that
 * goes up after a save so that the pages that hold the book of the bike read it again.
 */
export function useBikeEdit(garage: Garage | null, switchBike: (bikeId: string) => boolean) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(0);
  const edit = (bikeId?: string) => {
    const active = garage?.bikes.find((bike) => bike.isActive);
    if (bikeId && bikeId !== active?.id && !switchBike(bikeId)) return;
    setOpen(true);
  };
  return { open, edit, close: () => setOpen(false), saved, onSaved: () => setSaved((count) => count + 1) };
}
