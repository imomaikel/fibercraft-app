'use client';
import { useCurrentUser } from '@assets/hooks/useCurrentUser';
import { getPermissionFromLabel } from '@assets/lib/utils';
import { TAllNavLabels } from '@assets/lib/types';
import { useRouter } from 'next/navigation';

type TManagementPageWrapper = {
  children: React.ReactNode;
  pageLabel: TAllNavLabels;
};
const ManagementPageWrapper = ({ children, pageLabel }: TManagementPageWrapper) => {
  const { sessionStatus, user } = useCurrentUser();
  const router = useRouter();

  const userPermissions = user?.permissions;

  if (sessionStatus === 'loading') return null;
  if (sessionStatus === 'unauthenticated' || !userPermissions) {
    router.replace('/dashboard');
    return;
  }

  const requiredPermission = getPermissionFromLabel(pageLabel);
  if (
    !userPermissions.some(
      (userPermission) => userPermission === requiredPermission || userPermission === 'ALL_PERMISSIONS',
    )
  ) {
    router.replace('/dashboard');
    return;
  }

  return <div>{children}</div>;
};

export default ManagementPageWrapper;
