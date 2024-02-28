'use client';
import { useSession } from 'next-auth/react';

export const useCurrentUser = () => {
  const { update, data, status } = useSession();

  return {
    sessionStatus: status,
    updateSession: update,
    user: data?.user,
  };
};
