import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder } from 'discord.js';
import { colors } from '../../constans';
import { client } from '../../client';
import prisma from '../../lib/prisma';

type TCreateLinkEmbed = {
  guildId: string;
  channelId: string;
};
export const _createLinkEmbed = async ({ guildId, channelId }: TCreateLinkEmbed) => {
  const guild = client.guilds.cache.get(guildId);
  if (!guild?.id) return { error: true, message: 'Could not find the guild' };

  const guildData = await prisma.guild.findUnique({
    where: { id: guild.id },
    include: {
      widgets: true,
    },
  });
  if (!guildData?.id) return { error: true, message: 'Could not find the guild' };

  const channel = client.channels.cache.get(channelId);
  if (!channel?.id || channel.type !== ChannelType.GuildText) {
    return { error: true, message: 'Could not find the channel' };
  }

  const embed = new EmbedBuilder()
    .setColor(colors.purple)
    .setTitle('Friendly Fibercraft')
    .setThumbnail('https://friendly-fibercraft.com/fiber.webp')
    .addFields([
      {
        name: 'Link ARK',
        value: 'Use this button to link ARK to Discord! You will get a code to use in-game to complete the process.',
        inline: false,
      },
      {
        name: 'Kick Me',
        value:
          'After using "Link Ark" you will be able to use this to kick yourself off if your character gets stuck online.',
        inline: false,
      },
      {
        name: 'Get Your ID',
        value: 'Get your Steam / Epic ID after linking your Discord!',
        inline: false,
      },
    ]);

  const linkButton = new ButtonBuilder()
    .setCustomId(`${client.user?.id}-link`)
    .setStyle(ButtonStyle.Primary)
    .setLabel('🔗 Link ARK');
  const kickButton = new ButtonBuilder()
    .setCustomId(`${client.user?.id}-kick`)
    .setStyle(ButtonStyle.Danger)
    .setLabel('🦶 Kick Me');
  const infoButton = new ButtonBuilder()
    .setCustomId(`${client.user?.id}-info`)
    .setStyle(ButtonStyle.Secondary)
    .setLabel('🪪 Get Your IDs');

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(linkButton, kickButton, infoButton);

  try {
    await channel.bulkDelete(10).catch(() => {});
    const message = await channel.send({ embeds: [embed], components: [row] });
    if (message.id) {
      await prisma.guild.update({
        where: { id: guild.id },
        data: {
          widgets: {
            update: {
              discordLinkMessageId: message.id,
              discordLinkChannelId: channel.id,
            },
          },
        },
      });
      return { success: true, message: 'Widget sent!' };
    }
  } catch {}

  return { error: true, message: 'Could not send the message' };
};
