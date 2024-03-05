'use client';
import { useCurrentUser } from '@assets/hooks/useCurrentUser';
import NavLinks from './NavLinks';
import React from 'react';

const NavbarLinksAccess = () => {
  const { user } = useCurrentUser();

  const userPermissions = user?.permissions;

  if (!userPermissions) return null;

  return <NavLinks userPermissions={userPermissions} userSelectedGuildId={user.selectedDiscordId} />;
};

export default NavbarLinksAccess;
