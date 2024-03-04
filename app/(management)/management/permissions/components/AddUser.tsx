'use client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@ui/avatar';
import { useDebounceValue } from 'usehooks-ts';
import { CgSpinnerTwo } from 'react-icons/cg';
import AddPermission from './AddPermissions';
import { useEffect, useState } from 'react';
import { cn } from '@assets/lib/utils';
import { Button } from '@ui/button';
import { trpc } from '@trpc/index';
import { Input } from '@ui/input';
import Image from 'next/image';

type TAddUser = {
  isOpen: boolean;
  handleClose: () => void;
};
const AddUser = ({ isOpen, handleClose }: TAddUser) => {
  const [debouncedSearchText, setSearchText] = useDebounceValue('', 200);
  const [selectedUser, setSelectedUser] = useState({
    username: '',
    userId: '',
  });
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);

  const { mutate: searchForUsers, isLoading, data: users } = trpc.management.searchForUsers.useMutation();

  useEffect(() => {
    if (debouncedSearchText.length < 4) return;
    searchForUsers({
      searchText: debouncedSearchText,
    });
  }, [debouncedSearchText]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a new user</DialogTitle>
            <DialogDescription>Enter username or id in the field below.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col">
            <div className="relative">
              <Input onChange={(event) => setSearchText(event.target.value)} />
              {isLoading && (
                <div className="absolute right-2 top-0 flex h-full items-center">
                  <CgSpinnerTwo className="h-6 w-6 animate-spin" />
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">At least four characters</p>
          </div>
          <div className="h-[50vh] space-y-2 overflow-y-auto pr-2">
            {users?.map((entry) => (
              <div
                key={entry.value}
                className={cn(
                  'relative flex cursor-pointer items-center space-x-2 rounded border border-background p-1 transition-colors hover:bg-muted',
                  entry.value === selectedUser.userId && 'border-primary',
                )}
                role="button"
                aria-labelledby="select user"
                onClick={() => setSelectedUser({ userId: entry.value, username: entry.label })}
              >
                <Avatar>
                  <AvatarImage src={entry.avatar} />
                  <AvatarFallback>
                    <Image src="/logo.webp" className="h-full w-full" width={0} height={0} sizes="100vw" alt="avatar" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="tracking-wide">{entry.label}</span>
                  <span className="text-xs text-muted-foreground">ID: {entry.value}</span>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={handleClose}>
              Close
            </Button>
            <Button onClick={() => setPermissionModalOpen(true)} disabled={!selectedUser.userId}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {selectedUser.userId && (
        <AddPermission
          handleClose={() => setPermissionModalOpen(false)}
          isOpen={permissionModalOpen}
          userId={selectedUser.userId}
          username={selectedUser.username}
        />
      )}
    </>
  );
};

export default AddUser;
