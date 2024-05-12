import { handleInfoButton, handleKickButton, handleLinkButton } from '../plugins/discord-link';
import { checkBoostAccountLink } from '../plugins/boost';
import { event } from '../utils/events';

export default event('interactionCreate', async (client, interaction) => {
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
    }
  }
});
