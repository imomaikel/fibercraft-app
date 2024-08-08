import { createErrorEmbed, createSuccessEmbed } from '../../utils/embeds';
import { ButtonInteraction } from 'discord.js';
import prisma from '../../lib/prisma';
import { updatePollResult } from '.';
import { debounce } from 'lodash';

const update = debounce((pollId: string) => updatePollResult({ pollId }), 2_000);

type TOnPollOptionClick = { interaction: ButtonInteraction; pollId: string; optionId: number };
export const _onPollOptionClick = async ({ interaction, optionId, pollId }: TOnPollOptionClick) => {
  try {
    await interaction.deferReply({ ephemeral: true });

    const poll = await prisma.poll.findUnique({
      where: {
        id: pollId,
        messageId: interaction.message.id,
        options: {
          some: {
            order: optionId,
          },
        },
      },
      include: {
        ranks: true,
        options: {
          include: {
            votes: {
              where: {
                userDiscordId: {
                  equals: interaction.user.id,
                },
              },
            },
          },
        },
      },
    });

    if (!poll) {
      await interaction.editReply({
        embeds: [createErrorEmbed('Invalid poll.')],
      });
      return;
    }
    const user = interaction.user;
    const member = await interaction.guild?.members.fetch(user.id);

    if (!member?.id) {
      await interaction.editReply({
        embeds: [createErrorEmbed('Failed to load your roles.')],
      });
      return;
    }

    const currentTime = new Date().getTime();
    const expireTime = poll.expireAt ? poll.expireAt.getTime() : currentTime;

    if (poll.ended || currentTime > expireTime) {
      await interaction.editReply({
        embeds: [
          createErrorEmbed(
            poll.ended
              ? `Hey, ${user.toString()}\nThis poll has already closed.`
              : `Hey, ${user.toString()}\nThis poll has expired.`,
          ),
        ],
      });
      return;
    }

    const ranksWithMultipliers = poll.ranks.filter((rank) => {
      const hasThisRank = member.roles.cache.has(rank.roleId);
      return hasThisRank;
    });
    const highestRank = ranksWithMultipliers.sort((a, b) => b.pointsPerVote - a.pointsPerVote);
    const maxVotes = highestRank[0] ? highestRank[0].maxVotes : undefined;
    const pointsPerVote = highestRank[0] ? highestRank[0].pointsPerVote : 1;

    const userVotes = poll.options.reduce((acc, curr) => (acc += curr.votes.length), 0);

    const selectedOption = poll.options.find((option) => option.order === optionId);
    const isAlreadySelected = !!selectedOption?.votes.some((entry) => entry.userDiscordId === interaction.user.id);

    if (isAlreadySelected) {
      await interaction.editReply({
        embeds: [createSuccessEmbed('Your vote has been removed.\nThe poll results are currently being updated.')],
      });

      await prisma.poll.update({
        where: { id: poll.id },
        data: {
          options: {
            update: {
              where: {
                id: selectedOption!.id,
              },
              data: {
                votes: {
                  deleteMany: {
                    userDiscordId: user.id,
                  },
                },
              },
            },
          },
        },
      });

      update(poll.id);

      return;
    }

    if (maxVotes && userVotes >= maxVotes) {
      await interaction.editReply({
        embeds: [
          createErrorEmbed(
            'You have reached the maximum number of votes allowed. However, you still have the option to modify your vote.',
          ),
        ],
      });
      return;
    }

    await interaction.editReply({
      embeds: [
        createSuccessEmbed(
          `Thank you for casting your vote :handshake:\nThe poll results are currently being updated.\nYour vote multiplier is set at **${pointsPerVote}x**`,
        ),
      ],
    });

    await prisma.poll.update({
      where: { id: poll.id },
      data: {
        options: {
          update: {
            where: {
              id: selectedOption!.id,
            },
            data: {
              votes: {
                create: {
                  userDiscordId: user.id,
                  votes: pointsPerVote,
                },
              },
            },
          },
        },
      },
    });

    update(poll.id);
  } catch (err) {
    console.log(err);
    await interaction.editReply({ embeds: [createErrorEmbed('Something went wrong!')] }).catch(() => {});
  }
};
