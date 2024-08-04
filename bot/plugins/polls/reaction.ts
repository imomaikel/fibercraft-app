import { MessageReaction, PartialMessageReaction, PartialUser, User } from 'discord.js';
import { getUserReactions, removeUserReaction } from '../../utils/reaction';
import { getLetterFromRegionalIndicatorEmoji } from '../../constans';
import prisma from '../../lib/prisma';

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

    console.log('Trigger');

    if (!poll) return;

    const member = await guild?.members.fetch(user.id);

    const emojiAsLetter = getLetterFromRegionalIndicatorEmoji(emoji || '');
    const isReactionValid = poll.options.some((entry) => entry.letter === emojiAsLetter);

    if (!isReactionValid) {
      // TODO notify user
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
      console.log('Remove');
      await removeUserReaction(user.id, reaction);
      // TODO Notify user
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

    // TODO Notify user
  } catch (error) {
    console.log(error);
  }
};
