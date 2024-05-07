'use client';
import { HiStatusOffline, HiStatusOnline } from 'react-icons/hi';

type TOnlineStatus = {
  status: number | undefined;
};
const OnlineStatus = ({ status }: TOnlineStatus) => {
  if (status === undefined) return null;

  return (
    <div className="flex flex-col space-y-0.5">
      <p className="font-semibold tracking-wide">Online Status</p>
      <div className="flex h-9 w-40 items-center space-x-2 rounded-md border px-2">
        {status === 1 ? (
          <>
            <HiStatusOnline className="h-6 w-6 animate-pulse" />
            <span className="font-bold text-emerald-500">Online!</span>
          </>
        ) : (
          <>
            <HiStatusOffline className="h-6 w-6 animate-pulse" />
            <span className="font-bold text-destructive">Offline!</span>
          </>
        )}
      </div>
    </div>
  );
};

export default OnlineStatus;
