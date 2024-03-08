import { colors, extraSigns } from '../../constans';
import { EmbedBuilder, time } from 'discord.js';
import { client } from '../../client';
import prisma from '../../lib/prisma';

export const _sendTribeScore = async () => {
  const [tribes, config] = await Promise.all([
    prisma.tribeScore.findMany({
      orderBy: {
        score: 'desc',
      },
      take: 10,
    }),
    prisma.config.findFirst(),
  ]);

  if (!config) return;
  const { tribeScoreUpdateDelayMinutes } = config;

  const longestNameLength = tribes.slice().sort((a, b) => b.tribeName.length - a.tribeName.length)[0].tribeName.length;

  const content = tribes.map((tribe, index) => {
    const position = index + 1;
    const mode = tribe.mode === 'DEMOTE' ? '-' : tribe.mode === 'PROMOTE' ? '+' : ' ';
    const points = tribe.score.toLocaleString('de-DE');
    const positionSpace = position <= 9 ? ' ' : '';
    const tribeSpace = ' '.repeat(longestNameLength - tribe.tribeName.length + 4);
    const positiveProgress = tribe.progress >= 0;

    const line = `${mode} ${position}.${positionSpace}  ${tribe.tribeName}${tribeSpace} ${points} (${positiveProgress ? '+' : '-'}${Math.abs(tribe.progress)} score)`;
    return line;
  });

  const guilds = await prisma.guild.findMany({
    where: {
      widgets: {
        tribeScoreChannelId: {
          not: null,
        },
      },
    },
    include: {
      widgets: true,
    },
  });

  const embed = new EmbedBuilder()
    .setColor(colors.purple)
    .setDescription(`**Last update: ** ${time(new Date(), 'R')}`)
    .setFooter({
      text: `${extraSigns.zap} Auto update every ${tribeScoreUpdateDelayMinutes} minutes.`,
    })
    .addFields({
      name: 'How is it calculated?',
      value:
        'Each structure in the game has its certain points. Every time **you destroy** a structure you get points, as well as minus points when someone **destroys your** structure. Furthermore, collapsed structures are also tallied in the scoring system.',
    });

  for await (const _guild of guilds) {
    const guild = client.guilds.cache.get(_guild.id);
    if (!guild) continue;

    const chnId = _guild.widgets?.tribeScoreChannelId;
    const msgId = _guild.widgets?.tribeScoreMessageId;

    if (!chnId) continue;
    const channel = guild.channels.cache.get(chnId);
    if (!channel?.id || !channel.isTextBased()) continue;

    const message = msgId ? await channel.messages.fetch(msgId) : null;

    const title = 'PLACE | TRIBE NAME | POINTS (PROGRESS)\n';

    if (!message) {
      try {
        const newMessage = await channel.send({
          embeds: [embed],
          content: `\`\`\`diff\n${title + content.join('\n')}\`\`\``,
        });
        if (!newMessage.id) continue;
        await prisma.guild.update({
          where: { id: guild.id },
          data: {
            widgets: {
              update: {
                tribeScoreMessageId: newMessage.id,
              },
            },
          },
        });
      } catch {}
    } else {
      await message
        .edit({ embeds: [embed], content: `\`\`\`diff\n${title + content.join('\n')}\`\`\`` })
        .catch(() => {});
    }
  }
};
