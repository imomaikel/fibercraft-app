import { TDbGetNewTribeLogs } from './types';
import { getEnv } from '../utils/env';
import mysql from 'mysql';

const db = async (query: string, values?: string[]) => {
  try {
    const connection = mysql.createConnection({
      host: getEnv('DATABASE_HOST'),
      user: getEnv('DATABASE_USER'),
      password: getEnv('DATABASE_PASSWORD'),
      supportBigNumbers: true,
      connectTimeout: 5_000,
    });

    const result = await new Promise((resolve, reject) => {
      connection.query(
        {
          sql: query,
          ...(values && {
            values: values,
          }),
        },
        (err, res) => {
          if (err) {
            console.log(err);
            reject(null);
          }
          if (res && res[0]) return resolve(res);
          return reject();
        },
      );
    }).catch(() => null);

    connection.end();

    return typeof result === 'object' ? result : null;
  } catch {
    return null;
  }
};

export const dbCheckForFetchedTribesColumn = async () => {
  const data = (await db(
    'SHOW COLUMNS FROM tribesfiber.wtribes_events WHERE Field in ("timestamp", "fetched");',
  )) as any;
  if (!data?.length) {
    await db(
      'ALTER TABLE `tribesfiber`.`wtribes_events` ADD COLUMN `timestamp` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP AFTER `TribeName`, ADD COLUMN `fetched` TINYINT NULL DEFAULT 0 AFTER `timestamp`;',
    );
  }
};

export const dbUpdateTribeLogs = async (ids: string[]) => {
  await db(`UPDATE tribesfiber.wtribes_events SET fetched = 1 WHERE ID IN (${ids.join(',')})`);
};

export const dbGetNewTribeLogs = async () => {
  const data = await db(
    'SELECT l.ID AS id, l.TribeID AS tribeId, l.TribeName AS content, r.TribeName AS tribeName, l.timestamp FROM tribesfiber.wtribes_events l RIGHT JOIN tribesfiber.wtribes_tribedata r ON l.TribeID = r.tribeId WHERE l.EventType = 1012;',
  );
  return typeof data === 'object' ? (data as TDbGetNewTribeLogs) : null;
};
