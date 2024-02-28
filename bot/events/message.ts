import { temp_data } from '../lib/mysql';
import { event } from '../utils/events';

// Listen for a new message
export default event('messageCreate', async (client, message) => {
  if (message.author.bot) return;

  try {
    if (message.content.startsWith('$search')) {
      const args = message.content.split(' ');
      const search = args.slice(1).join(' ');

      if (search.length >= 1) {
        const data = await temp_data(search);
        if (data.length <= 4) {
          return message.channel.send({ content: 'No results.' });
        }
        if (data.length >= 1999) {
          return message.channel.send({ content: 'Too many results' });
        }
        return message.channel.send({ content: data });
      }
    }
  } catch {}
});
