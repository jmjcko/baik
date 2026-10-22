import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { ModeRouter } from '../ModeRouter';
import { Sidebar } from '../Sidebar';

const LOCALES: Locale[] = ['en', 'cs'];

describe.each(LOCALES)('navigation components (%s)', (locale) => {
  const t = translations[locale];
  const sidebarControls = { locale, theme: 'light' as const, onSetLocale: vi.fn(), onSetTheme: vi.fn() };

  it('should render the ModeRouter entry screen', () => {
    const { asFragment } = render(<ModeRouter t={t} currentMode="entry" onSelectMode={vi.fn()} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('should route to wizard and prepurchasing from the two path cards', () => {
    const onSelectMode = vi.fn();
    render(<ModeRouter t={t} currentMode="entry" onSelectMode={onSelectMode} />);
    fireEvent.click(screen.getByText(t.entryRouter.pathAButton));
    fireEvent.click(screen.getByText(t.entryRouter.pathBButton));
    expect(onSelectMode.mock.calls).toEqual([['wizard'], ['prepurchasing']]);
  });

  it.each(['entry', 'studio'] as const)('should render the Sidebar in %s mode', (mode) => {
    const { asFragment } = render(
      <Sidebar t={t} currentMode={mode} onSelectMode={vi.fn()} {...sidebarControls} inseamMm={812} discipline="Gravel" />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('should return to the hub from the sidebar sub-navigation', () => {
    const onSelectMode = vi.fn();
    render(<Sidebar t={t} currentMode="report" onSelectMode={onSelectMode} {...sidebarControls} />);
    fireEvent.click(screen.getByText(new RegExp(t.dashboard.backToHub)));
    expect(onSelectMode).toHaveBeenCalledWith('entry');
  });

  it('should call the language and theme handlers from the sidebar controls', () => {
    const onSetLocale = vi.fn();
    const onSetTheme = vi.fn();
    render(<Sidebar t={t} currentMode="entry" onSelectMode={vi.fn()} {...sidebarControls} onSetLocale={onSetLocale} onSetTheme={onSetTheme} />);
    fireEvent.click(screen.getByRole('button', { name: locale === 'en' ? 'CS' : 'EN' }));
    fireEvent.click(screen.getByRole('button', { name: t.navigation.themeDark }));
    expect(onSetLocale).toHaveBeenCalledWith(locale === 'en' ? 'cs' : 'en');
    expect(onSetTheme).toHaveBeenCalledWith('dark');
  });

  it('should show the guest block with a disabled sign in pill and no avatar', () => {
    render(<Sidebar t={t} currentMode="entry" onSelectMode={vi.fn()} {...sidebarControls} />);
    expect(screen.getByText(t.navigation.guestLabel)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: t.navigation.signInSoon })).toBeDisabled();
    expect(screen.getByText(t.navigation.guestLabel).parentElement?.querySelector('img, svg')).toBeNull();
  });
});
