'use client';

import { useEffect } from 'react';

/** Calls a handler when Escape is pressed, as a dialog should close. */
export function useEscape(onClose: () => void): void {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
}
