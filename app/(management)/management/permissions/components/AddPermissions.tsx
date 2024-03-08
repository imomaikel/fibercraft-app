'use client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@ui/dialog';
import { ManagementPermission } from '@prisma/client';
import { cn, errorToast } from '@assets/lib/utils';
import { CgSpinnerTwo } from 'react-icons/cg';
import { useMemo, useState } from 'react';
import { Button } from '@ui/button';
import { trpc } from '@trpc/index';
import { Badge } from '@ui/badge';
import { toast } from 'sonner';

type TAddPermission = {
  userId: string;
  username: string;
  isOpen: boolean;
  handleClose: () => void;
};
const AddPermission = ({ isOpen, handleClose, userId, username }: TAddPermission) => {
  const allPermissions = useMemo(() => {
    const permissions = Object.keys(ManagementPermission).filter((entry) => entry !== 'USER');
    permissions.sort((a, b) => b.length - a.length);

    return permissions;
  }, []);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const { isLoading, refetch } = trpc.management.getUserPermissions.useQuery(
    { userDiscordId: userId },
    {
      onSuccess: (permissions) => {
        setSelectedPermissions(permissions);
      },
      refetchOnWindowFocus: false,
      retry: 1,
    },
  );

  const { mutate: updatePermissions, isLoading: isUpdating } = trpc.management.updatePermissions.useMutation();

  const handleClick = (permission: ManagementPermission) => {
    if (selectedPermissions.includes(permission)) {
      setSelectedPermissions((prev) => prev.filter((entry) => entry !== permission));
    } else {
      setSelectedPermissions((prev) => [...prev, permission]);
    }
  };

  const handleUpdate = () => {
    updatePermissions(
      {
        permissions: selectedPermissions as ManagementPermission[],
        userDiscordId: userId,
      },
      {
        onError: (error) => errorToast(error.data),
        onSuccess: ({ error, success }) => {
          if (error) return toast.error('Something went wrong!');
          if (success) return toast.success('Permissions updated!');
          refetch();
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select permissions for: {username}</DialogTitle>
          <DialogDescription>You can change it later.</DialogDescription>
        </DialogHeader>
        <div className="relative flex h-12 flex-1">
          <div className="flex w-full select-none flex-wrap gap-1">
            {isLoading ? (
              <CgSpinnerTwo className="h-12 w-12 animate-spin" />
            ) : (
              allPermissions.map((permission) => {
                const selected = selectedPermissions.includes(permission);
                const disabled = permission === 'ALL_PERMISSIONS';
                return (
                  <Badge
                    key={permission}
                    className={cn('cursor-pointer', disabled && 'cursor-not-allowed')}
                    variant={selected ? 'default' : 'secondary'}
                    onClick={() => !disabled && handleClick(permission as ManagementPermission)}
                  >
                    {permission.replace(/_/g, ' ')}
                  </Badge>
                );
              })
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleClose}>
            Close
          </Button>
          {!isLoading && (
            <Button onClick={handleUpdate} disabled={isUpdating}>
              Update permissions
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddPermission;
