import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { dbCreateDiscordLink } from '../../lib/mysql';
import { colors } from '../../constans';
import crypto from 'node:crypto';

type THandleLinkButton = {
  interaction: ButtonInteraction;
};
export const _handleLinkButton = async ({ interaction }: THandleLinkButton) => {
  try {
    await interaction.deferReply({ ephemeral: true });

    const hash = crypto
      .createHash('sha1')
      .update(`${new Date().getTime()}${interaction.user.id}${Math.random()}`)
      .digest('hex')
      .slice(0, 15);

    const isSuccess = await dbCreateDiscordLink(interaction.user.id, hash);

    const embed = new EmbedBuilder();

    if (!isSuccess) {
      embed.setColor(colors.red);
      embed.setDescription('Something went wrong.');
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    embed.setColor(colors.purple);
    embed.setTitle('Account Link');
    embed.setDescription(
      `Use in-game command:\n \`/linkDiscord ${hash}\`\n to finish linking your Discord. This will override any existing link.`,
    );

    await interaction.editReply({ embeds: [embed] });
  } catch {
    await interaction.editReply({ content: 'Something went wrong!' }).catch(() => {});
  }
};
