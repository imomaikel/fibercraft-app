'use client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@assets/components/ui/table';
import MarketingSectionWrapper from './MarketingSectionWrapper';
import { motion } from 'framer-motion';
import { cn } from '@assets/lib/utils';
import { trpc } from '@trpc/index';
import { useRef } from 'react';

const Leaderboard = () => {
  const tribeScores = useRef<{ [key: string]: number }>({});

  const { data: tribes, isLoading } = trpc.publicRouter.getTopTribeScore.useQuery(undefined, {
    refetchOnWindowFocus: true,
    refetchInterval: 10_000,
    onSuccess: (tribeList) => {
      tribeList.forEach((tribe) => {
        const index = tribe.tribeId.toString();
        if (!tribeScores.current[index]) {
          tribeScores.current[index] = tribe.score;
        }
      });
    },
  });

  if (!tribes || isLoading) return null;

  return (
    <MarketingSectionWrapper theme="DARK" description="The Top 10 based on our in-game plugin" title="Team Leaderboard">
      <div className="flex flex-col items-center justify-center">
        <Table className="mx-auto max-w-xl">
          <TableHeader>
            <TableRow>
              <TableHead>Position</TableHead>
              <TableHead>Tribe</TableHead>
              <TableHead>Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tribes.map((tribe, idx) => {
              const index = tribe.tribeId.toString();
              const prevScore = tribeScores.current[index];
              tribeScores.current[index] = tribe.score;

              const newStatus = prevScore === tribe.score ? 'same' : tribe.score > prevScore ? 'more' : 'less';

              return (
                <TableRow
                  key={`tribe-${tribe.tribeId}`}
                  className={cn(
                    'relative',
                    idx === 0
                      ? 'text-2xl font-bold text-primary'
                      : idx === 1
                        ? 'text-xl font-semibold'
                        : idx === 2
                          ? 'text-lg font-medium'
                          : '',
                  )}
                >
                  <TableCell className="w-[100px]">{tribe.position}</TableCell>
                  <TableCell>{tribe.tribeName}</TableCell>
                  <TableCell>{tribe.score.toLocaleString('de-DE')}</TableCell>
                  <TableCell className="w-0 p-0">
                    <motion.div
                      initial={{
                        opacity: 0,
                      }}
                      animate={{
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 1.75,
                      }}
                      key={`tribe-${tribe.tribeId}:${tribe.score}`}
                      className={cn(
                        'absolute inset-0 -z-10 h-full w-full',
                        newStatus === 'more' && 'bg-green-500/50',
                        newStatus === 'less' && 'bg-destructive/50',
                        newStatus === 'same' && 'bg-transparent',
                      )}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <div>
          <p className="mt-1 text-muted-foreground">Auto update every 10 seconds.</p>
        </div>
      </div>
    </MarketingSectionWrapper>
  );
};

export default Leaderboard;
