import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { dbGetDiscordLink } from '../../lib/mysql';
import { colors } from '../../constans';

type THandleInfoButton = {
  interaction: ButtonInteraction;
};
export const _handleInfoButton = async ({ interaction }: THandleInfoButton) => {
  try {
    await interaction.deferReply({ ephemeral: true });

    const data = await dbGetDiscordLink(interaction.user.id);

    const embed = new EmbedBuilder();

    if (data?.SteamId && data.SteamId.length >= 4) {
      embed.setColor(colors.purple);
      embed.setDescription(`Your Steam / Epic ID:\n\`${data.SteamId}\``);
      await interaction.editReply({ embeds: [embed] });
      return;
    } else {
      embed.setColor(colors.red);
      embed.setDescription('You must use "Link Ark" before you can find your Steam / Epic ID.');
      await interaction.editReply({ embeds: [embed] });
      return;
    }
  } catch {
    await interaction.editReply({ content: 'Something went wrong!' }).catch(() => {});
  }
};
