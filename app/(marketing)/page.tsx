'use server';
import { dbGetFiberServers } from '../../bot/lib/mysql';
import Testimonials from './components/Testimonials';
import Leaderboard from './components/Leaderboard';
import WipeTime from './components/WipeTime';
import prisma from '../(assets)/lib/prisma';
import Servers from './components/Servers';
import Discord from './components/Discord';
import Staff from './components/Staff';

const MarketingPage = async () => {
  const [config, dbServers] = await Promise.all([prisma.config.findFirst(), dbGetFiberServers()]);

  const servers = dbServers
    ? dbServers.map((server) => ({
        mapName: server.mapName,
        lastStatus: server.lastStatus as 'online' | 'offline',
        lastPlayers: server.lastPlayers,
        queryPort: server.queryPort,
      }))
    : [];

  if (!config) return 'Database error';

  const { lastWipe, nextWipe, wipeDelayInDays } = config;

  return (
    <div className="flex flex-col">
      <section>
        <WipeTime lastWipe={lastWipe} nextWipe={nextWipe} wipeDelayInDays={wipeDelayInDays} />
      </section>
      <section>
        <Servers servers={servers} ipAddress={config.serverIp} />
      </section>
      <section>
        <Leaderboard />
      </section>
      <section>
        <Discord />
      </section>
      <section>
        <Testimonials />
      </section>
      <section>
        <Staff />
      </section>
    </div>
  );
};

export default MarketingPage;
