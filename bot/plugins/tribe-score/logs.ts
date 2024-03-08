import { dbCheckForFetchedTribesColumn, dbGetNewTribeLogs, dbUpdateTribeLogs } from '../../lib/mysql';
import { TribeLog } from '@prisma/client';
import prisma from '../../lib/prisma';

export const _fetchNewTribeLogs = async () => {
  await dbCheckForFetchedTribesColumn();

  const newLogs = await dbGetNewTribeLogs();
  if (!newLogs) return;

  const logsToCreate: TribeLog[] = [];
  const logsToUpdate: string[] = [];

  for (const log of newLogs) {
    const content = log.content
      .replace(/<RichColor Color=".{0,30}">/gi, '')
      .replace(/<\/>/gi, '')
      .replace(/[0-9]{6,12}/gi, '');

    if (log.tribeName) {
      logsToCreate.push({
        timestamp: log.timestamp,
        tribeId: log.tribeId,
        tribeName: log.tribeName,
        id: BigInt(log.id),
        content,
      });
    }
    logsToUpdate.push(log.id.toString());
  }

  await prisma.tribeLog.createMany({
    data: logsToCreate,
  });

  await dbUpdateTribeLogs(logsToUpdate);
};
