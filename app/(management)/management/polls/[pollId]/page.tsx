'use client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui/table';
import { useCurrentUser } from '@assets/hooks/useCurrentUser';
import { errorToast, relativeDate } from '@assets/lib/utils';
import { useParams, useRouter } from 'next/navigation';
import { Separator } from '@ui/separator';
import { Button } from '@ui/button';
import { trpc } from '@trpc/index';
import { Badge } from '@ui/badge';
import { toast } from 'sonner';
import Link from 'next/link';
import PollCreator from '../components/PollCreator';
import { useState } from 'react';

const PollIdPage = () => {
  const [showCopiedPoll, setShowCopiedPoll] = useState(false);
  const { pollId } = useParams<{ pollId: string }>();
  const { user } = useCurrentUser();
  const router = useRouter();

  const {
    data: poll,
    isLoading,
    refetch,
  } = trpc.management.getPoll.useQuery(
    { pollId },
    {
      refetchInterval: 2_500,
    },
  );

  const { mutate: closePoll, isLoading: isClosing } = trpc.management.closePoll.useMutation();
  const { mutate: sendPoll, isLoading: isSending } = trpc.management.sendPoll.useMutation();

  if (isLoading) return 'Loading';
  if (!poll) return 'Failed to find the poll';

  const { channelId, description, ended, expireAt, options, ranks, scheduleSend, title } = poll;

  const handleClosePoll = () => {
    closePoll(
      {
        pollId,
      },
      {
        onSuccess: (isSuccess) => {
          if (isSuccess) {
            toast.success('Poll closed!');
            refetch();
          } else {
            errorToast();
          }
        },
        onError: () => errorToast(),
      },
    );
  };
  const handleSendPoll = () => {
    sendPoll(
      {
        pollId,
      },
      {
        onSuccess: (isSuccess) => {
          if (isSuccess) {
            toast.success('Poll sent!');
            refetch();
          } else {
            errorToast();
          }
        },
        onError: () => errorToast(),
      },
    );
  };

  return (
    <div className="max-w-xl">
      <h2 className="flex items-center space-x-2">
        <span className="text-4xl font-bold">{title}</span>
        <Button variant="link" onClick={() => router.back()}>
          Go back
        </Button>
      </h2>
      {poll.ended && (
        <Badge variant="destructive" className="my-3">
          Poll is closed!
        </Badge>
      )}
      <p className="text-muted-foreground">{description}</p>

      <Separator className="my-8" />

      <h3 className="font-2xl font-medium">Poll Options</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Option</TableHead>
            <TableHead>Votes</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {options.map((option, idx) => (
            <TableRow key={`opt-${idx}`}>
              <TableCell>
                <Badge>{option.order}</Badge>
              </TableCell>
              <TableCell>{option.votes.reduce((acc, curr) => (acc += curr.votes), 0)}</TableCell>
              <TableCell>{option.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Separator className="my-8" />

      <h3 className="font-2xl font-medium">Poll Customized Ranks</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>Multiplier</TableHead>
            <TableHead>Max Votes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ranks.map((rank, idx) => (
            <TableRow key={`opt-${idx}`}>
              <TableCell>{rank.roleId}</TableCell>
              <TableCell>{rank.pointsPerVote}</TableCell>
              <TableCell>{rank.maxVotes}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Separator className="my-8" />

      <div>
        <h3 className="font-2xl font-medium">Controls</h3>
        <div className="mt-2 flex max-w-sm flex-col gap-4">
          {user?.selectedDiscordId && (
            <Button asChild>
              <Link
                target="_blank"
                href={`https://discord.com/channels/${user.selectedDiscordId}/${channelId}/${poll.messageId}`}
              >
                Open Discord View
              </Link>
            </Button>
          )}
          <Button
            className="flex flex-col"
            variant="destructive"
            size="lg"
            onClick={() => setShowCopiedPoll(!showCopiedPoll)}
          >
            <span>Copy the Poll</span>
          </Button>

          {showCopiedPoll && (
            <PollCreator
              defaultData={{
                ...poll,
                options: poll.options.map(({ id, description }) => ({ id: Number(id), description })),
                ranks: poll.ranks.map((rank) => {
                  const roleName = ranks.find(({ roleId }) => roleId === rank.roleId)?.roleId;
                  return {
                    ...rank,
                    description: poll.description || '',
                    roleName: roleName || 'Unknown role',
                  };
                }),
              }}
            />
          )}

          {!ended && (
            <Button
              className="flex flex-col"
              variant="destructive"
              size="lg"
              onClick={handleClosePoll}
              disabled={isClosing}
            >
              <span>Close the Poll</span>
              {expireAt && <span className="text-xs">Auto Expire: {relativeDate(expireAt)}</span>}
            </Button>
          )}
          {scheduleSend && !ended && (
            <Button className="flex flex-col" size="lg" onClick={handleSendPoll} disabled={isSending}>
              Send the Poll
              <span className="text-xs">Auto Send: {relativeDate(scheduleSend)}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PollIdPage;
