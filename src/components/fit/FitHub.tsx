'use client';

import React from 'react';
import { Bike, ScanSearch } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { PageHeader } from '@/components/primitives/PageHeader';
import { PathCard } from './PathCard';

interface FitHubProps {
  t: Translations;
  onTuneBike: () => void;
  onCheckBike: () => void;
}

/** The start page of the bAIkfit module: what it is and promises, then two big tiles, blue for tuning the bike I ride and green for checking a bike before I buy it. */
export const FitHub: React.FC<FitHubProps> = ({ t, onTuneBike, onCheckBike }) => {
  const f = t.shell.fitHub;
  return (
    <div className="space-y-8 pb-10" data-testid="fit-hub">
      <PageHeader eyebrow={t.navigation.baikfitEngine} title={f.title} subtitle={f.subtitle}>
        <ul className="flex flex-wrap gap-2 mt-4" data-testid="fit-promises">
          {f.chips.map((chip) => <li key={chip} className="h-8 px-3 inline-flex items-center rounded-full border border-line bg-surface text-xs font-semibold text-ink-2">{chip}</li>)}
        </ul>
      </PageHeader>
      <div className="grid gap-6 md:grid-cols-2">
        <PathCard testId="fit-path-a" texts={f.pathA} color="blue" icon={Bike} onSelect={onTuneBike} />
        <PathCard testId="fit-path-b" texts={f.pathB} color="green" icon={ScanSearch} onSelect={onCheckBike} />
      </div>
    </div>
  );
};
