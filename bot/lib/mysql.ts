import {
  TDbGetDiscordLink,
  TDbGetFiberServers,
  TDbGetNewTribeLogs,
  TDbGetPairedAccounts,
  TDbGetTopTribeScore,
  TDbGetTribeScore,
} from './types';
import { TribeScorePosition } from '@prisma/client';
import { getEnv } from '../utils/env';
import mysql from 'mysql2';

const pool = mysql.createPool({
  connectionLimit: 50,
  host: getEnv('DATABASE_HOST'),
  user: getEnv('DATABASE_USER'),
  password: getEnv('DATABASE_PASSWORD'),
  supportBigNumbers: true,
  connectTimeout: 5_000,
});

export const db = async (query: string, values?: string[]) => {
  let retries = 5;
  let delay = 2000;

  while (retries > 0) {
    try {
      const result = await new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
          if (err) {
            console.log('Error getting DB connection', err);
            reject(err);
          } else {
            connection.query(
              {
                sql: query,
                ...(values && {
                  values: values,
                }),
              },
              (error, res) => {
                connection.release();
                if (error) {
                  console.log('MySQL Error:', error);
                  reject(error);
                } else {
                  resolve(res);
                }
              },
            );
          }
        });
      });

      return result;
    } catch (err) {
      console.log('Database query failed, retrying...', err);
      retries -= 1;
      await new Promise((res) => setTimeout(res, delay));
      delay *= 2;
    }
  }

  console.log('Database query failed after retries');
  return null;
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
    'SELECT l.ID AS id, l.TribeID AS tribeId, l.TribeName AS content, r.TribeName AS tribeName, l.timestamp FROM tribesfiber.wtribes_events l RIGHT JOIN tribesfiber.wtribes_tribedata r ON l.TribeID = r.tribeId WHERE l.EventType = 1012 AND fetched = 0;',
  );
  return data ? (data as TDbGetNewTribeLogs) : null;
};

export const dbGetPairedAccounts = async (searchText: string) => {
  const searchById = await db(
    'SELECT steam_id as steamId, player_name as playerName FROM statisticsfiber.personal_stats where steam_id = ?;',
    [searchText],
  );
  const searchByName = await db(
    'SELECT steam_id as steamId, player_name as playerName FROM statisticsfiber.personal_stats where player_name like ?;',
    [`%${searchText}%`],
  );

  const byId = searchById ? (searchById as TDbGetPairedAccounts) : [];
  const byName = searchByName ? (searchByName as TDbGetPairedAccounts) : [];

  const results = [...byId, ...byName];
  return results;
};

export const dbGetFiberServers = async () => {
  const query = await db('SELECT * from webapp.server WHERE serverName LIKE "%Fiber%";', undefined);

  return query ? (query as TDbGetFiberServers) : [];
};

export const getTopTribeScore = async () => {
  const query = await db(
    // eslint-disable-next-line quotes
    `SELECT * FROM fibercraft.tribescore WHERE TribeName NOT LIKE '' ORDER BY score DESC LIMIT 10;`,
    undefined,
  );

  return query ? (query as TDbGetTopTribeScore) : [];
};
export const getAllTribeScore = async () => {
  const query = await db(
    // eslint-disable-next-line quotes
    `SELECT * FROM fibercraft.tribescore WHERE TribeName NOT LIKE '' ORDER BY SCORE DESC;`,
  );

  return query ? (query as TDbGetTopTribeScore) : [];
};
export const updateTribeScore = async (
  tribeId: bigint,
  progress: number,
  oldScore: number,
  position: number,
  mode: TribeScorePosition,
) => {
  await db(
    // eslint-disable-next-line quotes
    `UPDATE fibercraft.tribescore SET progress = ${progress}, oldScore = ${oldScore}, mode = '${mode}', position = ${position} WHERE TribeID = ${tribeId};`,
  );

  return;
};

export const dbCreateDiscordLink = async (discordId: string, hash: string) => {
  try {
    const getLink = await dbGetDiscordLink(discordId);
    if (getLink?.DiscordId) {
      await db('UPDATE kalcrosschatfiber.discordsteamlinks SET InviteCode = ? WHERE DiscordId = ?', [hash, discordId]);
    } else {
      await db('INSERT INTO kalcrosschatfiber.discordsteamlinks (SteamId, DiscordId, InviteCode) VALUES (?, ?, ?)', [
        '',
        discordId,
        hash,
      ]);
    }
    return true;
  } catch {}
  return false;
};
export const dbGetDiscordLink = async (discordId: string) => {
  const query = (await db('SELECT SteamId, DiscordId FROM kalcrosschatfiber.discordsteamlinks WHERE DiscordId = ?', [
    discordId,
  ])) as TDbGetDiscordLink[];

  if (query && query[0]) {
    return query[0];
  }

  return null;
};

export const dbGetTribeScore = async (tribeName: string) => {
  const query = (await db('SELECT tribeName, score FROM fibercraft.tribescore where tribeName LIKE ?;', [
    `%${tribeName.replace(/%/g, '')}%`,
  ])) as TDbGetTribeScore[];

  if (query && query[0]) {
    return query;
  }
  return [];
};
