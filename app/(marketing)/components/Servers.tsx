'use client';
import { HoverEffect } from '@ui/card-hover-effect';
import { FaSteam } from 'react-icons/fa';
import { useMemo } from 'react';
import Link from 'next/link';

type TServers = {
  servers: {
    mapName: string;
    lastStatus: string;
    lastPlayers: number;
    queryPort: number;
  }[];
  ipAddress: string;
};
const Servers = ({ servers, ipAddress }: TServers) => {
  const totalPlayers = useMemo(() => servers.reduce((acc, curr) => (acc += curr.lastPlayers), 0), [servers]);

  return (
    <div>
      <div className="mb-6">
        <p className="text-center text-4xl font-bold">The current season has 5 maps</p>
        <p className="text-center text-lg text-muted-foreground">There are {totalPlayers} players online now</p>
      </div>
      <HoverEffect
        items={servers.map((server) => ({
          description: (
            <div>
              <p>This map is {server.lastStatus}</p>
              <p>There are {server.lastPlayers} players</p>
              <p>
                IP:{' '}
                <span>
                  {ipAddress}:{server.queryPort}
                </span>
              </p>
            </div>
          ),
          extraContent: (
            <Link
              href={`steam://connect/${ipAddress}:${server.queryPort}`}
              className="group/extra absolute right-2 top-2 z-50 hidden cursor-pointer rounded-bl-2xl rounded-tr-2xl bg-slate-800/[0.8] transition-colors hover:bg-primary md:block"
            >
              <div className="flex items-center space-x-3 px-6 py-3">
                <span className="font-semibold text-white transition-colors group-hover/extra:text-black">
                  Click to join
                </span>
                <FaSteam className="h-8 w-8 text-primary transition-colors group-hover/extra:text-white" />
              </div>
            </Link>
          ),
          link: '/',
          title: `${server.mapName}`,
        }))}
      />
    </div>
  );
};

export default Servers;
