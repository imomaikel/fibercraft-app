'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@ui/avatar';
import Image from 'next/image';

type TUserAvatar = {
  url: string | null | undefined;
  fallback?: string;
};
const UserAvatar = ({ url, fallback }: TUserAvatar) => {
  return (
    <Avatar>
      <AvatarImage src={url || undefined} />
      <AvatarFallback>
        <Image
          src={fallback || '/logo.webp'}
          className="h-full w-full"
          width={0}
          height={0}
          sizes="100vw"
          alt="avatar"
        />
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
