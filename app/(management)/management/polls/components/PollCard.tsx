import { relativeDate } from '@assets/lib/utils';
import { MdSchedule } from 'react-icons/md';
import { GiPadlock } from 'react-icons/gi';
import { FaVoteYea } from 'react-icons/fa';
import Link from 'next/link';
import React from 'react';

type TPollCard = {
  title: string;
  description: string | null | undefined;
  id: string;
  expireAt: Date | null;
  scheduleSend: Date | null;
  ended: boolean;
};
const PollCard = ({ description, ended, expireAt, id, scheduleSend, title }: TPollCard) => {
  return (
    <Link
      className="flex h-48 w-96 shrink-0 flex-col rounded-md border p-2 transition-colors hover:border-primary"
      href={`/management/polls/${id}`}
    >
      <div>
        <span className="line-clamp-1 text-2xl">{title}</span>
      </div>
      {description && (
        <div>
          <span className="line-clamp-2 text-sm text-muted-foreground">{description}</span>
        </div>
      )}
      <div>
        {ended && (
          <div className="mt-4 flex items-center gap-2">
            <GiPadlock className="h-10 w-10" />
            <span className="font-bold">Poll ended</span>
          </div>
        )}
        {!ended && scheduleSend && (
          <div className="mt-4 flex items-center gap-2">
            <MdSchedule className="h-10 w-10" />
            <div className="flex flex-col">
              <span className="font-bold text-primary">Poll scheduled</span>
              <span className="text-xs text-muted-foreground">{relativeDate(scheduleSend)}</span>
            </div>
          </div>
        )}
        {!ended && !scheduleSend && (
          <div className="mt-4 flex items-center gap-2">
            <FaVoteYea className="h-10 w-10" />
            <span className="font-bold text-emerald-500">Poll active</span>
          </div>
        )}
      </div>
      {expireAt && (
        <div className="mt-auto text-right">
          <span className="text-sm text-muted-foreground">
            Expiry date: <span>{relativeDate(expireAt)}</span>
          </span>
        </div>
      )}
    </Link>
  );
};

export default PollCard;
