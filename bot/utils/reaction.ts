import { MessageReaction, PartialMessageReaction } from 'discord.js';

export const removeUserReactions = async (userId: string, reaction: MessageReaction | PartialMessageReaction) => {
  const userReactions = reaction.message.reactions.cache.filter((entry) => entry.users.cache.has(userId));

  try {
    await Promise.all(
      userReactions.map(async (entry) => {
        await entry.users.remove(userId);
      }),
    );
  } catch {}
};

export const removeUserReaction = async (userId: string, reaction: MessageReaction | PartialMessageReaction) => {
  const userReactions = reaction.message.reactions.cache.filter((entry) => entry.users.cache.has(userId));

  try {
    await Promise.all(
      userReactions.map(async (entry) => {
        if (entry.emoji.name === reaction.emoji.name) {
          await entry.users.remove(userId);
        }
      }),
    );
  } catch {}
};

export const getUserReactions = async (userId: string, reaction: MessageReaction | PartialMessageReaction) => {
  const userReactions = reaction.message.reactions.cache.filter((entry) => entry.users.cache.has(userId));

  return userReactions;
};
