'use client';

import { useState } from 'react';

interface Garage {
  bikes: Array<{ id: string; isActive: boolean }>;
}

/**
 * The screens of one bike (Epic 54): the "Edit bike" dialog (whether it is open, a counter that goes up after a save so that the pages that hold the book
 * of the bike read it again) and the page of a bike, which is the Garage of bAIkcare: picking a bike in "Riding now" makes it the active one and opens it.
 */
export function useBikeEdit(garage: Garage | null, switchBike: (bikeId: string) => boolean, selectMode: (mode: 'care') => void) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(0);
  const [garageRequested, setGarageRequested] = useState(false);
  const edit = (bikeId?: string) => {
    const active = garage?.bikes.find((bike) => bike.isActive);
    if (bikeId && bikeId !== active?.id && !switchBike(bikeId)) return;
    setOpen(true);
  };
  /** Makes the bike the active one (when it is not) and shows its page; false when the switch did not work. */
  const openBike = (bikeId: string) => {
    const active = garage?.bikes.find((bike) => bike.isActive);
    if (bikeId !== active?.id && !switchBike(bikeId)) return false;
    setGarageRequested(true);
    selectMode('care');
    return true;
  };
  return { open, edit, close: () => setOpen(false), saved, onSaved: () => setSaved((count) => count + 1), openBike, garageRequested, onGarageShown: () => setGarageRequested(false) };
}
