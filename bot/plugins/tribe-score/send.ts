import prisma from '../../lib/prisma';

export const _sendTribeScore = async () => {
  const tribes = await prisma.tribe.findMany({
    orderBy: {
      points: 'desc',
    },
    take: 10,
  });

  const longestNameLength = tribes.slice().sort((a, b) => b.tribeName.length - a.tribeName.length)[0].tribeName.length;

  const content = tribes.map((tribe, index) => {
    const position = index + 1;
    const mode = tribe.newScoreMode === 'DEMOTE' ? '-' : tribe.newScoreMode === 'PROMOTE' ? '+' : ' ';
    const modeIcon = tribe.newScoreMode === 'DEMOTE' ? '🡻' : tribe.newScoreMode === 'PROMOTE' ? '🡹' : ' ';
    const points = tribe.points.toLocaleString('de-DE');
    const positionSpace = position <= 9 ? ' ' : '';
    const tribeSpace = ' '.repeat(longestNameLength - tribe.tribeName.length + 4);

    const line = `${mode} ${position}.${positionSpace} ${tribe.tribeName}${tribeSpace} ${modeIcon} ${points}`;
    return line;
  });

  // TODO
  const messageContent = `\`\`\`diff\n${content.join('\n')}\`\`\``;
  return messageContent;
};
