import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { resetStoredPreferences } from '@/lib/hooks/useStoredPreference';

/** Every test starts with the default language and theme: what one test chose must not reach the next one. */
afterEach(() => {
  resetStoredPreferences();
  try {
    window.localStorage.removeItem('baik_locale');
    window.localStorage.removeItem('baik_theme');
  } catch {
    /* no storage in this environment */
  }
});
