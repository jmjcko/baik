'use client';

import React from 'react';
import { ListChecks } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { NavItem } from './NavItem';

/** "Fitting capabilities" in the sidebar: open to everyone, guests included. */
export const CapabilitiesLink: React.FC<{ t: Translations; active: boolean; onOpen: () => void }> = ({ t, active, onOpen }) => (
  <NavItem icon={ListChecks} label={t.navigation.capabilities} active={active} onClick={onOpen} />
);
