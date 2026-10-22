'use client';

import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { useAuth } from '@/lib/auth/AuthContext';
import { cx } from '@/lib/classNames';

interface ProfileLinkProps {
  t: Translations;
  active: boolean;
  onOpen: () => void;
}

/** "My profile" in the sidebar: only a signed in rider has a profile page, so a guest sees nothing here. */
export const ProfileLink: React.FC<ProfileLinkProps> = ({ t, active, onOpen }) => {
  const { status } = useAuth();
  if (status !== 'authenticated') return null;
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-current={active ? 'page' : undefined}
      className={cx(
        'w-full text-left px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-colors',
        active ? 'bg-blue-600 text-white shadow-sm' : 'border border-slate-700/60 text-slate-200 hover:bg-slate-800/60'
      )}
    >
      {t.navigation.myProfile}
    </button>
  );
};
