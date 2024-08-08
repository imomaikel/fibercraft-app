import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { PollOption } from '@prisma/client';
import { client } from '../../client';

type TCreatePollButtons = {
  options: PollOption[];
  pollId: string;
};
export const _createPollButtons = ({ options, pollId: id }: TCreatePollButtons) => {
  const rows = Math.ceil(options.length / 5);
  const actionRows: ActionRowBuilder<ButtonBuilder>[] = [];
  const lastRowColumns = options.length - (rows - 1) * 5;

  let idx = 0;
  for (let i = 0; i < rows; i++) {
    const isLastRow = i + 1 === rows;
    const rowColumns = Array.from(Array(isLastRow ? lastRowColumns : 5).keys());

    const rowBuilder = new ActionRowBuilder<ButtonBuilder>();
    const extraRow = new ActionRowBuilder<ButtonBuilder>();

    const buttons: ButtonBuilder[] = [];

    rowColumns.forEach(() => {
      const option = options[idx];
      buttons.push(
        new ButtonBuilder()
          .setCustomId(`${client.user?.id}-poll|${id}:${option.order}`)
          .setLabel(`Option ${option.order}`)
          .setStyle(ButtonStyle.Primary),
      );
      idx++;
    });

    let hasExtraRow = false;

    if (isLastRow) {
      const myVotesButton = new ButtonBuilder()
        .setCustomId(`${client.user?.id}-poll-check|${id}`)
        .setLabel('My Votes')
        .setStyle(ButtonStyle.Success);

      if (buttons.length === 5) {
        extraRow.addComponents(myVotesButton);
        hasExtraRow = true;
      } else {
        buttons.push(myVotesButton);
      }
    }

    rowBuilder.addComponents(buttons);

    actionRows.push(rowBuilder);

    if (hasExtraRow) {
      actionRows.push(extraRow);
    }
  }

  return actionRows;
};
