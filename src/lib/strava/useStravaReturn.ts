'use client';

import { useEffect } from 'react';
import { captureStravaReturn } from './returnFlag';

/** After the return from Strava (`?strava=<result>`) the page opens bAIkcare, where the Strava card shows the result; the address is cleaned. */
export function useStravaReturn(openCare: () => void): void {
  useEffect(() => {
    if (!captureStravaReturn(window.location.search)) return;
    window.history.replaceState(null, '', window.location.pathname);
    openCare();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
