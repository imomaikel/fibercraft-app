import { updateTribeScore } from '../plugins/tribe-score';
import { hoursToMilliseconds } from 'date-fns';
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

  // TODO
  if (process.env.NODE_ENV === 'production') {
    setInterval(() => {
      updateTribeScore();
    }, hoursToMilliseconds(6));
  }

  console.log(`Discord client started. (${client.user?.username})`);
});
