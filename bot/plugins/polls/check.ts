import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { colors, numberEmojis } from '../../constans';
import { createErrorEmbed } from '../../utils/embeds';
import prisma from '../../lib/prisma';

type TCheckPollVotes = { interaction: ButtonInteraction; pollId: string };

export const _checkPollVotes = async ({ interaction, pollId }: TCheckPollVotes) => {
  try {
    await interaction.deferReply({ ephemeral: true });

    const userVotes = await prisma.vote.findMany({
      where: {
        pollOption: {
          pollId,
        },
        userDiscordId: interaction.user.id,
      },
      include: {
        pollOption: {
          include: {
            votes: {
              where: {
                userDiscordId: interaction.user.id,
              },
            },
          },
        },
      },
    });

    if (!userVotes.length) {
      // prettier-ignore
      await interaction.editReply({ embeds: [createErrorEmbed('You haven\'t participated in this poll yet.')] });
      return;
    }

    const embed = new EmbedBuilder().setColor(colors.purple);

    userVotes.sort((a, b) => a.pollOption.order - b.pollOption.order);

    userVotes.forEach((entry) => {
      const votes = entry.pollOption.votes.reduce((acc, curr) => (acc += curr.votes), 0);

      embed.addFields({
        name: `Option ${numberEmojis[entry.pollOption.order - 1]}`,
        value: `Selected. Multiplier: **${votes}x**`,
      });
    });

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    console.log(err);
    await interaction.editReply({ embeds: [createErrorEmbed('Something went wrong!')] }).catch(() => {});
  }
};
