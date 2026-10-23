import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { translations, type Locale } from '@/lib/i18n/translations';
import { Sidebar } from '../Sidebar';

describe.each(['en', 'cs'] as Locale[])('bAIk Studio branding (%s)', (locale) => {
  const t = translations[locale];

  it('should name the app bAIk Studio with the new slogan in the sidebar header', () => {
    render(<Sidebar t={t} currentMode="entry" onSelectMode={vi.fn()} locale={locale} theme="light" onSetLocale={vi.fn()} onSetTheme={vi.fn()} />);
    expect(screen.getByText('bAIk Studio', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText(t.common.tagline)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: `bAIk Studio - ${t.common.tagline}` })).toBeInTheDocument();
  });

  it('should use the agreed slogans and no longer the old name or slogan', () => {
    expect(t.common.appTitle).toBe('bAIk Studio');
    expect(t.common.tagline).toBe(locale === 'en' ? 'Your AI-Powered Cycling Hub' : 'Vaše AI centrum pro perfektní posed a údržbu');
    expect(t.navigation.studio).toBe('bAIk Studio');
    expect(JSON.stringify([t.common, t.navigation])).not.toMatch(/Universal AI Cycling Intelligence|Univerzální centrum/);
  });
});
