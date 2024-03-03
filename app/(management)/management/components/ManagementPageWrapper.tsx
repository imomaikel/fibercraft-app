'use client';
import { useCurrentUser } from '@assets/hooks/useCurrentUser';
import { getPermissionFromLabel } from '@assets/lib/utils';
import { TAllNavLabels } from '@assets/lib/types';
import { MdArrowBack } from 'react-icons/md';
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

  const navItem = getPermissionFromLabel(pageLabel);
  if (
    !navItem ||
    !userPermissions.some(
      (userPermission) => userPermission === navItem?.permission || userPermission === 'ALL_PERMISSIONS',
    )
  ) {
    router.replace('/dashboard');
    return;
  }

  return (
    <div>
      <div className="mb-6 flex flex-col">
        <div className="flex items-center space-x-2">
          <h1 className="text-3xl font-bold">{navItem.label}</h1>
          <div
            className="mt-1 flex items-center text-sm text-muted-foreground transition-colors hover:text-primary"
            role="button"
            aria-labelledby="go back"
            onClick={() => router.back()}
          >
            <MdArrowBack />
            Go back
          </div>
        </div>
        <p className="text-muted-foreground">{navItem.description}</p>
      </div>
      <div className="flex flex-col space-y-6">{children}</div>
    </div>
  );
};

export default ManagementPageWrapper;
