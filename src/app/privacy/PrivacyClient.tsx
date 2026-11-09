'use client';

import React from 'react';
import Link from 'next/link';
import { translations, type Locale, type Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { LOCALE_KEY, useStoredPreference } from '@/lib/hooks/useStoredPreference';
import { CONTROLLER } from '@/lib/consent/purposes';
import { ConsentSection } from '@/components/consent/ConsentSection';
import { Segmented } from '@/components/primitives/Segmented';
import { VersionLine } from '@/components/navigation/VersionLine';

const LOCALES: readonly Locale[] = ['en', 'cs'];

const Header: React.FC<{ t: Translations }> = ({ t }) => {
  const p = t.consent.privacy;
  return (
    <header className="space-y-2">
      <h1 className="text-2xl font-bold tracking-tight text-ink">{p.title}</h1>
      <p className="text-sm text-ink-2">{p.subtitle}</p>
      <p className="font-mono text-xs uppercase tracking-wider text-ink-3">{p.updated}</p>
      <p role="note" className="rounded-xl border border-tone-warning-line bg-tone-warning-bg p-3 text-sm text-tone-warning-ink">{p.draftNote}</p>
    </header>
  );
};

const Controller: React.FC<{ t: Translations }> = ({ t }) => {
  const p = t.consent.privacy;
  return (
    <section aria-labelledby="privacy-controller" className="space-y-2">
      <h2 id="privacy-controller" className="text-lg font-bold text-ink">{p.controllerHeading}</h2>
      <p className="text-sm text-ink-2 leading-relaxed">{fill(p.controllerLine, { name: CONTROLLER.name })}</p>
      <p data-testid="privacy-contact" className="text-sm text-ink-2 leading-relaxed">{CONTROLLER.contact ? fill(p.contactLine, { contact: CONTROLLER.contact }) : p.contactMissing}</p>
    </section>
  );
};

/** The privacy text, in the language of the app; the rider can change every consent at the end, signed in or not. */
export const PrivacyClient: React.FC = () => {
  const [locale, setLocale] = useStoredPreference<Locale>(LOCALE_KEY, LOCALES, 'en');
  const t = translations[locale];
  return (
    <main className="min-h-screen bg-[var(--bg-canvas)] text-ink font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="text-sm font-semibold text-accent-ink underline underline-offset-2">{t.consent.privacy.back}</Link>
          <Segmented label={t.navigation.languageLabel} options={[{ value: 'en', text: 'EN' }, { value: 'cs', text: 'CS' }]} value={locale} onChange={setLocale} />
        </div>
        <Header t={t} />
        <Controller t={t} />
        {t.consent.privacy.sections.map((section, index) => (
          <section key={section.heading} aria-labelledby={`privacy-${index}`} className="space-y-2">
            <h2 id={`privacy-${index}`} className="text-lg font-bold text-ink">{section.heading}</h2>
            {section.paragraphs.map((text) => <p key={text} className="text-sm text-ink-2 leading-relaxed">{text}</p>)}
          </section>
        ))}
        <ConsentSection t={t} showPrivacyLink={false} />
        <VersionLine t={t} />
      </div>
    </main>
  );
};
