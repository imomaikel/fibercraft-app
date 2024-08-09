import { colors, numberEmojis } from '../../constans';
import { EmbedBuilder, time } from 'discord.js';

type TCreatePollEmbed = {
  description: string | null | undefined;
  title: string;
  expireAt: Date | undefined;
  options: { description: string; order: number; title?: string }[];
  isExpired?: boolean;
  footerText?: string;
};
export const _createPollEmbed = ({
  description,
  expireAt,
  title,
  options,
  isExpired,
  footerText,
}: TCreatePollEmbed) => {
  const embed = new EmbedBuilder()
    .setColor(colors.green)
    .setTitle(title)
    .setFooter({ text: 'Keep in mind that some roles have more vote power' });

  if (description) {
    embed.setDescription(description);
  }

  if (isExpired) {
    embed.addFields({
      name: ':closed_lock_with_key: Poll closed!',
      value: 'This poll is closed. You can see the results below.',
    });
  }

  if (footerText) {
    embed.setFooter({
      text: `Keep in mind that some roles have more vote power \n${footerText}`,
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
