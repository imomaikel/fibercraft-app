import { colors, createRegionalLetterIndicator, POLL_LETTERS } from '../../constans';
import { EmbedBuilder, time } from 'discord.js';

type TCreatePollEmbed = {
  description: string;
  title: string;
  expireAt: Date | undefined;
  options: { description: string; letter: (typeof POLL_LETTERS)[number] }[];
};
export const _createPollEmbed = ({ description, expireAt, title, options }: TCreatePollEmbed) => {
  if (expireAt) {
    description += `\n\nThis poll expires ${time(expireAt, 'R')}`;
  }

  const embed = new EmbedBuilder().setColor(colors.green).setTitle(title).setDescription(description);

  options.forEach((option) =>
    embed.addFields({
      name: `Option ${createRegionalLetterIndicator(option.letter)}`,
      value: option.description,
    }),
  );

  return embed;
};
