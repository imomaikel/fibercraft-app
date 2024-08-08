import { handleInfoButton, handleKickButton, handleLinkButton } from '../plugins/discord-link';
import { checkPollVotes, onPollOptionClick } from '../plugins/polls';
import { checkBoostAccountLink } from '../plugins/boost';
import { event } from '../utils/events';

export default event('interactionCreate', async (client, interaction) => {
  try {
    if (interaction.user.bot) return;
    if (!client.user?.id) return;

    if (interaction.isButton()) {
      if (!interaction.customId.startsWith(client.user.id)) return;
      const command = interaction.customId.substring(client.user.id.length + 1);

      if (command.startsWith('boost')) {
        await checkBoostAccountLink({ interaction });
      } else if (command === 'link') {
        await handleLinkButton({ interaction });
      } else if (command === 'info') {
        await handleInfoButton({ interaction });
      } else if (command === 'kick') {
        await handleKickButton({ interaction });
      } else if (command.startsWith('poll-check')) {
        const pollId = command.substring('poll-check'.length + 1);

        await checkPollVotes({ interaction, pollId });
      } else if (command.startsWith('poll')) {
        const data = command.substring('poll'.length + 1);
        const [pollId, optionIdString] = data.split(':');

        const optionId = parseInt(optionIdString);

        await onPollOptionClick({
          interaction,
          optionId,
          pollId,
        });
      }
    }
  } catch {}
});
