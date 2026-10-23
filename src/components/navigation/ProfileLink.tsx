'use client';

import React from 'react';
import { UserRound } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { useAuth } from '@/lib/auth/AuthContext';
import { NavItem } from './NavItem';

interface ProfileLinkProps {
  t: Translations;
  active: boolean;
  onOpen: () => void;
}

/** "My profile" in the sidebar: only a signed in rider has a profile page, so a guest sees nothing here. */
export const ProfileLink: React.FC<ProfileLinkProps> = ({ t, active, onOpen }) => {
  const { status } = useAuth();
  if (status !== 'authenticated') return null;
  return <NavItem icon={UserRound} label={t.navigation.myProfile} active={active} onClick={onOpen} />;
};
