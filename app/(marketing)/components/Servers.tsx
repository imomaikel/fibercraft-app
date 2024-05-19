'use client';
import MarketingSectionWrapper from './MarketingSectionWrapper';
import { FaMapMarkedAlt, FaSteam } from 'react-icons/fa';
import { HoverEffect } from '@ui/card-hover-effect';
import { LuClipboardCopy } from 'react-icons/lu';
import { useEffect, useState } from 'react';
import { TiWarning } from 'react-icons/ti';
import { TbSlash } from 'react-icons/tb';
import { Skeleton } from '@ui/skeleton';
import { cn } from '@assets/lib/utils';
import { trpc } from '@trpc/index';
import { toast } from 'sonner';
import Link from 'next/link';

type TServers = {
  ipAddress: string;
};
const Servers = ({ ipAddress }: TServers) => {
  const [totalPlayers, setTotalPlayers] = useState(0);

  const { data: servers, isLoading } = trpc.publicRouter.getServers.useQuery(undefined, {
    refetchOnWindowFocus: true,
    refetchInterval: 10_000,
  });

  useEffect(() => {
    if (servers) {
      const players = servers.reduce((acc, curr) => (acc += curr.lastPlayers), 0);
      setTotalPlayers(players);
    }
  }, [servers]);

  return (
    <MarketingSectionWrapper title="Season Maps" description="Find a map that suits you" theme="DARK">
      {isLoading ? (
        <>
          <Skeleton className="mx-auto mb-6 h-[32px] w-[400px]" />
          <Skeleton className="mx-auto mb-6 h-[40px] w-[475px]" />
        </>
      ) : (
        <div>
          <div className="mb-6 flex items-center justify-center text-2xl">
            <span>{servers?.length} season maps</span>
            <div className="mx-4">
              <TbSlash className="h-8 w-8" />
            </div>
            <span>{totalPlayers} players</span>
          </div>
          <div className="mb-6 hidden items-center justify-center space-x-2 md:flex">
            <TiWarning className="h-12 w-12 animate-bounce text-destructive" />
            <p className="max-w-sm text-center text-sm font-medium">
              &quot;Click to join&quot; buttons work only for Steam players and your game needs to be closed before use.
            </p>
            <TiWarning className="h-12 w-12 animate-bounce text-destructive" />
          </div>
        </div>
      )}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4  p-2 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-[194px] rounded-2xl" />
          <Skeleton className="h-[194px] rounded-2xl" />
          <Skeleton className="h-[194px] rounded-2xl" />
          <Skeleton className="h-[194px] rounded-2xl" />
          <Skeleton className="h-[194px] rounded-2xl" />
          <Skeleton className="h-[194px] rounded-2xl" />
        </div>
      ) : servers ? (
        <HoverEffect
          items={servers.map((server, idx) => ({
            title: (
              <div className="flex items-start space-x-2">
                <FaMapMarkedAlt className="h-6 w-6" />
                <span className="capitalize">{server.mapName}</span>
              </div>
            ),
            description: (
              <div>
                <p>
                  This map is{' '}
                  <span
                    className={cn(
                      'font-semibold',
                      server.lastStatus === 'online' ? 'text-emerald-500' : 'text-destructive',
                    )}
                  >
                    {server.lastStatus}
                  </span>
                </p>
                {server.lastPlayers === 0 ? (
                  <p>There are no players online</p>
                ) : server.lastPlayers === 1 ? (
                  <p>
                    There is <span className="font-semibold">{server.lastPlayers}</span> player online
                  </p>
                ) : (
                  <p>
                    There are <span className="font-semibold">{server.lastPlayers}</span> players online
                  </p>
                )}
                <div className="flex items-center space-x-2">
                  <span>IP:</span>
                  <span>
                    {ipAddress}:{server.queryPort}
                  </span>
                  <div
                    role="button"
                    aria-label="copy ip"
                    className="flex items-center rounded-md px-2 py-1 text-sm transition-colors hover:bg-muted"
                    onClick={() => {
                      toast.info('Copied!');
                      window.navigator.clipboard.writeText(`${ipAddress}:${server.queryPort}`);
                    }}
                  >
                    Click to copy
                    <LuClipboardCopy className="ml-2" />
                  </div>
                </div>
              </div>
            ),
            extraContent:
              server.lastStatus === 'online' ? (
                <Link
                  prefetch={false}
                  href={`steam://run/346110//+connect%20${ipAddress}:${server.queryPort}`}
                  className="group/extra absolute right-2 top-2 z-20 hidden cursor-pointer rounded-bl-2xl rounded-tr-2xl bg-slate-800/[0.8] transition-colors hover:bg-primary md:block"
                >
                  <div className="flex items-center space-x-3 px-6 py-3">
                    <span className="font-semibold text-white transition-colors group-hover/extra:text-black">
                      Click to join
                    </span>
                    <FaSteam
                      className="h-8 w-8 animate-pulse text-primary transition-colors group-hover/extra:text-white"
                      style={{
                        animationDelay: `${0.25 * idx}s`,
                      }}
                    />
                  </div>
                </Link>
              ) : undefined,
          }))}
        />
      ) : (
        <p>No</p>
      )}
    </MarketingSectionWrapper>
  );
};

export default Servers;
