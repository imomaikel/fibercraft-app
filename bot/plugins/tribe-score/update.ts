import { calculateTribePoints, sendTribeScore } from '.';

export const _updateTribeScore = async () => {
  await calculateTribePoints();

  await sendTribeScore();
};

// TODO
