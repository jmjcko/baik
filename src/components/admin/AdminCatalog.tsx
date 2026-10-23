'use client';

import React, { useState } from 'react';
import type { Locale, Translations } from '@/lib/i18n/translations';
import { cx } from '@/lib/classNames';
import { useAdminStatus } from '@/lib/catalog/hooks';
import { CatalogTab } from './CatalogTab';
import { PILL_OUTLINE } from './AdminParts';
import { QueueTab } from './QueueTab';
import { UploadTab } from './UploadTab';
import { useAdminData } from './useAdminData';

type Tab = 'queue' | 'upload' | 'catalog';
const TABS: Tab[] = ['queue', 'upload', 'catalog'];

const Header: React.FC<{ t: Translations }> = ({ t }) => (
  <header>
    <span className="font-mono text-xs uppercase tracking-wider text-accent-ink">{t.admin.navLabel}</span>
    <h1 className="text-3xl font-extrabold tracking-tight text-ink mt-1">{t.admin.title}</h1>
    <p className="text-sm text-ink-2 leading-relaxed mt-2 max-w-3xl">{t.admin.subtitle}</p>
  </header>
);

const Tabs: React.FC<{ t: Translations; tab: Tab; counts: Record<Tab, number | null>; onChange: (tab: Tab) => void }> = ({ t, tab, counts, onChange }) => (
  <div role="tablist" className="flex flex-wrap gap-2">
    {TABS.map((name) => (
      <button
        key={name}
        type="button"
        role="tab"
        aria-selected={tab === name}
        onClick={() => onChange(name)}
        className={cx('h-10 px-5 rounded-full text-sm font-semibold border transition-colors', tab === name ? 'bg-blue-600 border-blue-600 text-slate-50' : 'border-line bg-surface text-ink-2 hover:bg-sunken')}
      >
        {t.admin.tabs[name]}{counts[name] === null ? '' : ` (${counts[name]})`}
      </button>
    ))}
  </div>
);

/** The owner's page: the queue of shared bikes, the upload of manufacturer tables and the approved catalog. */
const AdminContent: React.FC<{ t: Translations; locale: Locale }> = ({ t, locale }) => {
  const [tab, setTab] = useState<Tab>('queue');
  const admin = useAdminData();
  const { data } = admin;
  if (data.status === 'loading') return <p role="status" className="text-sm text-ink-2">{t.admin.checking}</p>;
  if (data.status === 'error') return <div className="space-y-3"><p role="alert" className="text-sm text-tone-danger-ink">{t.admin.loadError}</p><button type="button" onClick={() => void admin.reload()} className={PILL_OUTLINE}>{t.admin.reload}</button></div>;
  return (
    <div className="space-y-6">
      <Tabs t={t} tab={tab} counts={{ queue: data.pending.length, upload: null, catalog: data.catalog.length }} onChange={setTab} />
      {tab === 'queue' && <QueueTab t={t} locale={locale} pending={data.pending} catalog={data.catalog} actions={admin} />}
      {tab === 'upload' && <UploadTab t={t} catalog={data.catalog} actions={admin} />}
      {tab === 'catalog' && <CatalogTab t={t} rows={data.catalog} actions={admin} />}
    </div>
  );
};

/** "Catalog admin": shown only to an admin (asked of the database); everyone else gets a short refusal. */
export const AdminCatalog: React.FC<{ t: Translations; locale: Locale }> = ({ t, locale }) => {
  const status = useAdminStatus();
  return (
    <div className="space-y-8 pb-10" data-testid="admin-catalog">
      <Header t={t} />
      {status === 'checking' && <p role="status" className="text-sm text-ink-2">{t.admin.checking}</p>}
      {status === 'denied' && <p role="alert" className="text-sm text-ink-2">{t.admin.denied}</p>}
      {status === 'admin' && <AdminContent t={t} locale={locale} />}
    </div>
  );
};
