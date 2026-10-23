'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { useIsAdmin } from '@/lib/catalog/hooks';
import { NavItem } from './NavItem';

/** "Catalog admin" in the sidebar: shown only to an admin (the database says who is one); the page asks again. */
export const AdminLink: React.FC<{ t: Translations; active: boolean; onOpen: () => void }> = ({ t, active, onOpen }) => {
  const admin = useIsAdmin();
  if (!admin) return null;
  return <NavItem icon={ShieldCheck} label={t.admin.navLabel} active={active} onClick={onOpen} />;
};
