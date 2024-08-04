import { getLetterFromRegionalIndicatorEmoji } from '../../constans';
import { removeUserReaction } from '../../utils/reaction';
import { ChannelType } from 'discord.js';
import { client } from '../../client';
import prisma from '../../lib/prisma';
import { updatePollResult } from '.';

export const _fetchOldPollsReactions = async () => {
  const guilds = await prisma.guild.findMany({
    where: {
      polls: {
        some: {
          ended: {
            equals: false,
          },
        },
      },
    },
    include: {
      polls: {
        where: {
          ended: {
            equals: false,
          },
          messageId: {
            not: null,
          },
        },
        include: {
          ranks: true,
          options: true,
        },
      },
    },
  });

  for await (const guild of guilds) {
    const polls = guild.polls;

    for await (const poll of polls) {
      const currentTime = new Date().getTime();
      const expireTime = poll.expireAt ? poll.expireAt.getTime() : 0;

      if (!poll.messageId || poll.ended || currentTime > expireTime) continue;
      const channel = client.channels.cache.get(poll.channelId);
      const reactionCount: { [userId: string]: number } = {};

      if (!channel || channel.type !== ChannelType.GuildText) {
        await prisma.guild.update({
          where: { id: guild.id },
          data: {
            polls: {
              update: {
                where: {
                  messageId: poll.messageId,
                },
                data: {
                  ended: true,
                },
              },
            },
          },
        });
      } else {
        const message = await channel.messages.fetch(poll.messageId).catch(() => null);
        if (!message?.id) {
          await prisma.guild.update({
            where: { id: guild.id },
            data: {
              polls: {
                update: {
                  where: {
                    messageId: poll.messageId,
                  },
                  data: {
                    ended: true,
                  },
                },
              },
            },
          });
          continue;
        }

        const reactions = message.reactions.cache;

        const pollResults: { [letter: string]: number } = {};
        poll.options.forEach((option) => (pollResults[option.letter] = 0));

        for await (const reaction of reactions.values()) {
          const emojiAsLetter = getLetterFromRegionalIndicatorEmoji(reaction.emoji.name || '');
          const isReactionValid = poll.options.some((entry) => entry.letter === emojiAsLetter);

          const reactionUsers = await reaction.users.fetch();

          const users = reactionUsers.filter((entry) => !entry.bot);
          if (!users.size) continue;

          await Promise.all(
            users.map(async (user) => {
              if (!isReactionValid) {
                await removeUserReaction(user.id, reaction);
                return;
              }
              const totalUserReactions = reactionCount[user.id] || 0;

              const member = await reaction.message.guild?.members.fetch(user.id);
              if (!member) {
                await removeUserReaction(user.id, reaction);
                return;
              }

              const ranksWithMultipliers = poll.ranks.filter((rank) => {
                const hasThisRank = member.roles.cache.has(rank.roleId);
                return hasThisRank;
              });

              const highestRank = ranksWithMultipliers.sort((a, b) => b.pointsPerVote - a.pointsPerVote);
              const maxVotes = highestRank[0] ? highestRank[0].maxVotes : undefined;
              const pointsPerVote = highestRank[0] ? highestRank[0].pointsPerVote : 1;

              if (maxVotes && totalUserReactions + 1 > maxVotes) {
                await removeUserReaction(user.id, reaction);
                return;
              }

              const currentVotes = pollResults[emojiAsLetter as string] || 0;

              pollResults[emojiAsLetter as string] = currentVotes + pointsPerVote;

              reactionCount[user.id] = totalUserReactions + 1;
            }),
          );
        }

        await Promise.all(
          poll.options.map(async (option) => {
            const oldVotesCount = option.votes;
            const newVotesCount = pollResults[option.letter];

            if (newVotesCount === undefined || oldVotesCount === newVotesCount) return;

            await prisma.poll.update({
              where: { id: poll.id },
              data: { options: { updateMany: { where: { letter: option.letter }, data: { votes: newVotesCount } } } },
            });
          }),
        );

        await updatePollResult({ pollId: poll.id });
      }
    }
  }

  client.pollsReady = true;
};
