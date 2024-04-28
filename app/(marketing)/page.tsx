'use server';
import { dbGetFiberServers } from '../../bot/lib/mysql';
import Testimonials from './components/Testimonials';
import WipeTime from './components/WipeTime';
import prisma from '../(assets)/lib/prisma';
import Servers from './components/Servers';
import Discord from './components/Discord';
import Staff from './components/Staff';

const TEMP_SERVERS: {
  mapName: string;
  lastStatus: string;
  lastPlayers: number;
  queryPort: number;
}[] = [
  {
    lastPlayers: 2,
    lastStatus: 'online',
    mapName: 'The Island',
    queryPort: 1,
  },
  {
    lastPlayers: 33,
    lastStatus: 'online',
    mapName: 'The Center',
    queryPort: 2,
  },
  {
    lastPlayers: 44,
    mapName: 'Ragnarok',
    lastStatus: 'online',
    queryPort: 3,
  },
  {
    lastPlayers: 12,
    lastStatus: 'online',
    mapName: 'Genesis',
    queryPort: 4,
  },
  {
    lastPlayers: 0,
    lastStatus: 'offline',
    mapName: 'Test',
    queryPort: 5,
  },
];

const MarketingPage = async () => {
  const [config] = await Promise.all([prisma.config.findFirst()]);
  // const [config, servers] = await Promise.all([prisma.config.findFirst(), dbGetFiberServers()]);

  if (!config) return 'Database error';

  const { lastWipe, nextWipe, wipeDelayInDays } = config;

  return (
    <div className="flex flex-col">
      <section>
        <WipeTime lastWipe={lastWipe} nextWipe={nextWipe} wipeDelayInDays={wipeDelayInDays} />
      </section>
      <section>
        <Servers servers={TEMP_SERVERS} ipAddress={config.serverIp} />
      </section>
      <section>
        <Discord />
      </section>
      <section>
        {/* TODO Fix overflow */}
        <Testimonials />
      </section>
      <section>
        <Staff />
      </section>
    </div>
  );
};

export default MarketingPage;
