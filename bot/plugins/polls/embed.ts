import { colors, numberEmojis } from '../../constans';
import { EmbedBuilder, time } from 'discord.js';

type TCreatePollEmbed = {
  description: string;
  title: string;
  expireAt: Date | undefined;
  options: { description: string; order: number; title?: string }[];
  isExpired?: boolean;
};
export const _createPollEmbed = ({ description, expireAt, title, options, isExpired }: TCreatePollEmbed) => {
  const embed = new EmbedBuilder()
    .setColor(colors.green)
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: 'Keep in mind that some roles have more vote power' });

  if (isExpired) {
    embed.addFields({
      name: ':closed_lock_with_key: Poll closed!',
      value: 'This poll is closed. You can see the results below.',
    });
  }

  options.forEach((option) =>
    embed.addFields({
      name: option.title || `Option ${numberEmojis[option.order - 1]}`,
      value: option.description,
    }),
  );

  if (expireAt) {
    embed.addFields({
      name: ':alarm_clock: Poll expiry date',
      value: time(expireAt, 'R'),
    });
  }

  return embed;
};
