import { MessageReaction, PartialMessageReaction, PartialUser, User } from 'discord.js';
import { getUserReactions, removeUserReaction } from '../../utils/reaction';
import { getLetterFromRegionalIndicatorEmoji } from '../../constans';
import { sendErrorEmbed, sendSuccessEmbed } from '../../utils/embeds';
import prisma from '../../lib/prisma';
import { updatePollResult } from '.';
import { debounce } from 'lodash';

const update = debounce((pollId: string) => updatePollResult({ pollId }), 2_000);

type THandlePollReaction = {
  user: User | PartialUser;
  reaction: MessageReaction | PartialMessageReaction;
  method: 'add' | 'remove';
};
export const _handlePollReaction = async ({ reaction, user, method }: THandlePollReaction) => {
  try {
    const messageId = reaction.message.id;
    const guild = reaction.message.guild;
    const emoji = reaction.emoji.name;

    const poll = await prisma.poll.findUnique({
      where: {
        messageId,
      },
      include: {
        ranks: true,
        options: true,
      },
    });

    if (!poll) return;

    const member = await guild?.members.fetch(user.id);

    const emojiAsLetter = getLetterFromRegionalIndicatorEmoji(emoji || '');
    const isReactionValid = poll.options.some((entry) => entry.letter === emojiAsLetter);

    if (!isReactionValid) {
      if (method === 'add') {
        await sendErrorEmbed({
          channel: reaction.message.channel,
          deleteAfter: 10,
          content: `Hey, ${user.toString()}\nYou can not use ${reaction.emoji.name} reaction to vote in this poll.`,
        });
      }
      await removeUserReaction(user.id, reaction);
      return;
    }

    if (!guild?.id || !member?.id) return;

    const ranksWithMultipliers = poll.ranks.filter((rank) => {
      const hasThisRank = member.roles.cache.has(rank.roleId);
      return hasThisRank;
    });

    const highestRank = ranksWithMultipliers.sort((a, b) => b.pointsPerVote - a.pointsPerVote);

    const maxVotes = highestRank[0] ? highestRank[0].maxVotes : undefined;
    const pointsPerVote = highestRank[0] ? highestRank[0].pointsPerVote : 1;

    const userReactions = await getUserReactions(user.id, reaction);
    if (maxVotes && userReactions.size > maxVotes) {
      await removeUserReaction(user.id, reaction);
      await sendErrorEmbed({
        channel: reaction.message.channel,
        deleteAfter: 10,
        content: `Hey, ${user.toString()}\nYou have reached the maximum number of votes allowed. However, you still have the option to modify your vote.`,
      });
    } else {
      await sendSuccessEmbed({
        channel: reaction.message.channel,
        deleteAfter: 10,
        content:
          method === 'add'
            ? `Hey, ${user.toString()}\nThank you for casting your vote :handshake:\nThe poll results are currently being updated.\nYour vote multiplier is set at **${pointsPerVote}x**`
            : `Hey, ${user.toString()}\nYour vote has been removed.\nThe poll results are currently being updated.`,
      });
    }

    await prisma.poll.update({
      where: { id: poll.id },
      data: {
        options: {
          updateMany: {
            where: {
              letter: emojiAsLetter,
            },
            data: {
              votes: {
                ...(method === 'add'
                  ? {
                      increment: pointsPerVote,
                    }
                  : {
                      decrement: pointsPerVote,
                    }),
              },
            },
          },
        },
      },
    });

    update(poll.id);

    // TODO Notify user
  } catch (error) {
    console.log(error);
  }
};
