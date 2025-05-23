import StorePreview from './components/StorePreview';
import Testimonials from './components/Testimonials';
import Leaderboard from './components/Leaderboard';
import WipeTime from './components/WipeTime';
import prisma from '../(assets)/lib/prisma';
import Servers from './components/Servers';
import Discord from './components/Discord';
import Staff from './components/Staff';

const MarketingPage = async () => {
  const config = await prisma.config.findFirst();

  if (!config) return 'Database error';

  const { lastWipe, nextWipe, wipeDelayInDays } = config;

  return (
    <div className="flex flex-col">
      <section>
        <WipeTime lastWipe={lastWipe} nextWipe={nextWipe} wipeDelayInDays={wipeDelayInDays} />
      </section>

      <section id="join-links">
        <Servers ipAddress={config.serverIp} />
      </section>
      <section>
        <StorePreview />
      </section>
      <section>
        <Leaderboard />
      </section>
      <section id="discord">
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

export const revalidate = 3600;
