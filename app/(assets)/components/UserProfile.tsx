'use client';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/popover';
import { useCurrentUser } from '@assets/hooks/useCurrentUser';
import { AvatarFallback } from '@radix-ui/react-avatar';
import { HiChevronDoubleDown } from 'react-icons/hi';
import { signIn, signOut } from 'next-auth/react';
import { Avatar, AvatarImage } from '@ui/avatar';
import { Skeleton } from '@ui/skeleton';
import { Button } from '@ui/button';
import Image from 'next/image';

const UserProfile = () => {
  const { user, sessionStatus } = useCurrentUser();

  if (sessionStatus === 'loading') {
    return <Skeleton className="h-12 w-48" />;
  }

  if (sessionStatus === 'unauthenticated' || !user) {
    return (
      <div
        className="cursor-pointer rounded-md px-2 py-1 text-center transition-colors hover:bg-muted"
        role="button"
        aria-labelledby="login"
        onClick={() => signIn('discord')}
      >
        <p className="text-sm text-red-500">You are not logged in!</p>
        <p className="text-xs text-muted-foreground">Click to login.</p>
      </div>
    );
  }

  return (
    <>
      <Popover>
        <PopoverTrigger className="group">
          <div className="flex cursor-default items-center space-x-2 rounded-md px-2 py-1 transition-colors hover:bg-muted group-data-[state=open]:bg-muted">
            <div>
              <HiChevronDoubleDown className="transition-transform group-data-[state=open]:rotate-180" />
            </div>
            <div className="max-w-[128px]">
              <p className="truncate font-semibold">{user.name}</p>
            </div>
            <div>
              <Avatar>
                <AvatarImage src={user?.image || undefined} />
                <AvatarFallback>
                  <Image src="/logo.webp" className="h-full w-full" width={0} height={0} sizes="100vw" alt="avatar" />
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent>
          <Button className="w-full" variant="secondary" aria-labelledby="logout" onClick={() => signOut()}>
            Logout
          </Button>
        </PopoverContent>
      </Popover>
    </>
  );
};

export default UserProfile;
