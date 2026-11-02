import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { toggleAccountMenu } from '@/test/accountMenu';
import { Sidebar } from '../Sidebar';

const LOCALES: Locale[] = ['en', 'cs'];

describe.each(LOCALES)('navigation components (%s)', (locale) => {
  const t = translations[locale];
  const sidebarControls = { locale, theme: 'light' as const, onSetLocale: vi.fn(), onSetTheme: vi.fn() };

  it.each(['entry', 'studio'] as const)('should render the Sidebar in %s mode', (mode) => {
    const { asFragment } = render(
      <Sidebar t={t} currentMode={mode} onSelectMode={vi.fn()} {...sidebarControls} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it.each(['entry', 'report', 'profile', 'care'] as const)('should look the same in %s mode: no back row, the logo leads to the hub', (mode) => {
    const onSelectMode = vi.fn();
    render(<Sidebar t={t} currentMode={mode} onSelectMode={onSelectMode} {...sidebarControls} />);
    expect(screen.queryByText(/^←/)).toBeNull();
    fireEvent.click(screen.getByText(t.common.appTitle));
    expect(onSelectMode).toHaveBeenCalledWith('entry');
  });

  it('should call the language and theme handlers from the sidebar controls', () => {
    const onSetLocale = vi.fn();
    const onSetTheme = vi.fn();
    render(<Sidebar t={t} currentMode="entry" onSelectMode={vi.fn()} {...sidebarControls} onSetLocale={onSetLocale} onSetTheme={onSetTheme} />);
    toggleAccountMenu();
    fireEvent.click(screen.getByRole('button', { name: locale === 'en' ? 'CS' : 'EN' }));
    fireEvent.click(screen.getByRole('button', { name: t.navigation.themeDark }));
    expect(onSetLocale).toHaveBeenCalledWith(locale === 'en' ? 'cs' : 'en');
    expect(onSetTheme).toHaveBeenCalledWith('dark');
  });

  it('should show the guest row with a disabled sign in item in the menu and no avatar', () => {
    render(<Sidebar t={t} currentMode="entry" onSelectMode={vi.fn()} {...sidebarControls} />);
    expect(screen.getByText(t.navigation.guestLabel)).toBeInTheDocument();
    expect(screen.getByText(t.navigation.guestLabel).parentElement?.querySelector('img, svg')).toBeNull();
    toggleAccountMenu();
    expect(screen.getByRole('menuitem', { name: t.navigation.signInSoon })).toBeDisabled();
  });
});
