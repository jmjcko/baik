import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { resetStoredPreferences } from '@/lib/hooks/useStoredPreference';
import { resetConsents } from '@/lib/consent/useConsent';
import { PURCHASES_STORAGE_KEY, resetPurchaseStore } from '@/lib/gear/purchaseStore';

/** Every test starts with the default language and theme: what one test chose must not reach the next one. */
afterEach(() => {
  resetStoredPreferences();
  resetPurchaseStore();
  resetConsents();
  try {
    window.localStorage.removeItem('baik_locale');
    window.localStorage.removeItem('baik_theme');
    window.localStorage.removeItem(PURCHASES_STORAGE_KEY);
  } catch {
    /* no storage in this environment */
  }
});
