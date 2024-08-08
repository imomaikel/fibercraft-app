import { Channel, ChannelType, EmbedBuilder } from 'discord.js';
import { secondsToMilliseconds } from 'date-fns';
import { colors } from '../constans';

type TSendErrorEmbed = {
  channel: Channel;
  content: string;
  deleteAfter: 'never' | number;
};
export const sendErrorEmbed = async ({ content, channel, deleteAfter }: TSendErrorEmbed) => {
  if (channel.type !== ChannelType.GuildText) return;
  try {
    const embed = new EmbedBuilder().setColor(colors.red).setDescription(content);

    if (deleteAfter) {
      embed.setFooter({ text: `This message will disappear in ${deleteAfter} seconds.` });
    }

    await channel.send({ embeds: [embed] }).then((msg) => {
      if (deleteAfter !== 'never') {
        setTimeout(() => msg.delete().catch(() => {}), secondsToMilliseconds(deleteAfter));
      }
    });
  } catch {}
};

export const createErrorEmbed = (content: string) => {
  const embed = new EmbedBuilder().setColor(colors.red).setDescription(content);
  return embed;
};
export const createSuccessEmbed = (content: string) => {
  const embed = new EmbedBuilder().setColor(colors.green).setDescription(content);
  return embed;
};

type TSendSuccessEmbed = {
  channel: Channel;
  content: string;
  deleteAfter: 'never' | number;
};
export const sendSuccessEmbed = async ({ content, channel, deleteAfter }: TSendSuccessEmbed) => {
  if (channel.type !== ChannelType.GuildText) return;
  try {
    const embed = new EmbedBuilder().setColor(colors.green).setDescription(content);

    if (deleteAfter) {
      embed.setFooter({ text: `This message will disappear in ${deleteAfter} seconds.` });
    }

    await channel.send({ embeds: [embed] }).then((msg) => {
      if (deleteAfter !== 'never') {
        setTimeout(() => msg.delete().catch(() => {}), secondsToMilliseconds(deleteAfter));
      }
    });
  } catch {}
};
