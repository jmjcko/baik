import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { ModeRouter } from '../ModeRouter';
import { Sidebar } from '../Sidebar';
import { TopNavbar } from '../TopNavbar';

const LOCALES: Locale[] = ['en', 'cs'];

describe.each(LOCALES)('navigation components (%s)', (locale) => {
  const t = translations[locale];

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
      <Sidebar t={t} currentMode={mode} onSelectMode={vi.fn()} inseamMm={812} discipline="Gravel" />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('should return to the hub from the sidebar sub-navigation', () => {
    const onSelectMode = vi.fn();
    render(<Sidebar t={t} currentMode="report" onSelectMode={onSelectMode} />);
    fireEvent.click(screen.getByText(new RegExp(t.dashboard.backToHub)));
    expect(onSelectMode).toHaveBeenCalledWith('entry');
  });

  it.each(['light', 'dark'] as const)('should render the TopNavbar with the %s theme', (theme) => {
    const { asFragment } = render(
      <TopNavbar locale={locale} theme={theme} t={t} onToggleLocale={vi.fn()} onToggleTheme={vi.fn()} onSelectBaikfit={vi.fn()} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('should call the toggle handlers from the TopNavbar', () => {
    const onToggleLocale = vi.fn();
    const onToggleTheme = vi.fn();
    render(
      <TopNavbar locale={locale} theme="light" t={t} onToggleLocale={onToggleLocale} onToggleTheme={onToggleTheme} onSelectBaikfit={vi.fn()} />
    );
    fireEvent.click(screen.getByLabelText('Toggle language'));
    fireEvent.click(screen.getByLabelText('Toggle theme'));
    expect(onToggleLocale).toHaveBeenCalledTimes(1);
    expect(onToggleTheme).toHaveBeenCalledTimes(1);
  });
});
