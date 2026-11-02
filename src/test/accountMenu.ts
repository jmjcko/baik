import { fireEvent, screen, within } from '@testing-library/react';
import type { Translations } from '@/lib/i18n/translations';

/** Opens the account menu at the top of the sidebar (a second call closes it). */
export function toggleAccountMenu(): void {
  fireEvent.click(within(screen.getByTestId('account-menu')).getAllByRole('button')[0]);
}

const closeMenu = () => fireEvent.keyDown(document, { key: 'Escape' });

/** Chooses the language in the account menu and closes the menu again. */
export function pickLanguage(code: 'EN' | 'CS'): void {
  toggleAccountMenu();
  fireEvent.click(within(screen.getByRole('menu', { hidden: false })).getByRole('button', { name: code }));
  closeMenu();
}

/** Chooses the theme in the account menu and closes the menu again. */
export function pickTheme(name: string): void {
  toggleAccountMenu();
  fireEvent.click(within(screen.getByRole('menu')).getByRole('button', { name }));
  closeMenu();
}

/** Opens "My profile" from the account menu (it appears once the sign in is known). */
export async function openProfile(t: Translations): Promise<void> {
  toggleAccountMenu();
  fireEvent.click(await screen.findByRole('menuitem', { name: t.navigation.myProfile }));
}

/** Opens "Fitting capabilities" from the account menu. */
export function openCapabilities(t: Translations): void {
  toggleAccountMenu();
  fireEvent.click(screen.getByRole('menuitem', { name: t.navigation.capabilities }));
}

/** Opens the bike dialog from "Riding now" in the sidebar ("Add a bike"). */
export function addBikeFromSidebar(t: Translations): void {
  fireEvent.click(screen.getByTestId('riding-now'));
  fireEvent.click(screen.getByRole('menuitem', { name: t.shell.sidebar.addBike }));
}
