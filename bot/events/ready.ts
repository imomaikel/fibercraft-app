import { hoursToMilliseconds, minutesToMilliseconds } from 'date-fns';
import { fetchOldReactions } from '../plugins/testimonials';
import { updateTribeScore } from '../plugins/tribe-score';
import { refetchTebexCategories } from '../../tebex';
import { handlePollsEvents } from '../plugins/polls';
import { revalidateBoosts } from '../plugins/boost';
import scheduleEvents from '../plugins/scheduler';
import { event } from '../utils/events';
import prisma from '../lib/prisma';

// Wait for client to start
export default event('ready', async (client) => {
  // Add new guilds to the database
  const storedGuilds = (
    await prisma.guild.findMany({
      select: {
        id: true,
      },
    })
  ).map((entry) => entry.id);
  for await (const guildEntries of client.guilds.cache) {
    const guild = guildEntries['1'];
    if (storedGuilds.includes(guild.id)) continue;
    try {
      await prisma.guild.create({
        data: {
          id: guild.id,
          name: guild.name,
          widgets: {
            create: {},
          },
        },
      });
      console.log(`Added a new guild: ${guild.name}`);
    } catch {}
  }

  // Fetch old reaction
  fetchOldReactions();
  handlePollsEvents();

  // TODO
  // Get shop data
  setInterval(() => {
    refetchTebexCategories();
  }, minutesToMilliseconds(2.5));
  refetchTebexCategories();

  if (process.env.NODE_ENV === 'production' && process.env.FORCE_PRIVATE_IP_IMPORTANT === 'false') {
    scheduleEvents();
    // Check boosts
    setInterval(() => {
      revalidateBoosts();
    }, hoursToMilliseconds(1));

    //  Update tribe scores
    setInterval(() => {
      updateTribeScore();
    }, hoursToMilliseconds(1));
    updateTribeScore();
  }

  console.log(`Discord client started. (${client.user?.username})`);
});
