'use server';
import { db } from '../../../bot/lib/mysql';

type TMethods = {
  'Steam ID': {
    characterName: string;
    characterNameFallback: string;
    playerId: number;
    tribeId: number | null;
    tribeName: string | null;
    discordId: string | null;
    map: string;
    lastLogin: number;
    playTime: number;
  }[];
  'Player ID': {
    characterName: string;
    characterNameFallback: string;
    steamId: string;
    tribeId: number | null;
    tribeName: string | null;
    discordId: string | null;
    map: string;
    lastLogin: number;
    playTime: number;
  }[];
  'Discord ID': {
    characterName: string;
    characterNameFallback: string;
    steamId: string;
    tribeId: number | null;
    tribeName: string | null;
    playerId: number;
    map: string;
    lastLogin: number;
    playTime: number;
  }[];
  Character: {
    steamId: string;
    playerId: number;
    tribeId: number | null;
    tribeName: string | null;
    discordId: string | null;
    map: string;
    lastLogin: number;
    playTime: number;
    characterName: string;
    characterNameFallback: string;
  }[];
  Tribe: {
    tribeName: string;
    tribeId: number;
    members: {
      tribeName: string;
      tribeId: number;
      characterName: string;
      characterNameFallback: string;
      playerId: number;
      steamId: string;
      playTime: number;
      lastLogin: number;
      map: string;
    }[];
  }[];
};

type TMethod = keyof TMethods;
type SearchReturn<T extends TMethod> = T extends 'Steam ID'
  ? TMethods['Steam ID']
  : T extends 'Player ID'
    ? TMethods['Player ID']
    : T extends 'Discord ID'
      ? TMethods['Discord ID']
      : T extends 'Character'
        ? TMethods['Character']
        : T extends 'Tribe'
          ? TMethods['Tribe']
          : never;

export const advancedSearch = async <T extends TMethod>(
  method: T,
  input: string,
): Promise<{ method: T; result: SearchReturn<T> | [] }> => {
  let query = '';

  if (method === 'Steam ID') {
    query = `
      SELECT 
          s.CharacterName AS characterName,
          n.player_name AS characterNameFallback,
          s.PlayerID AS playerId,
          s.TribeID AS tribeId,
          s.LastMap AS map,
          n.last_login AS lastLogin,
          n.play_time AS playTime,
          r.TribeName AS tribeName,
          t.DiscordId AS discordId
      FROM
          statisticsfiber.personal_stats n
              RIGHT JOIN
          tribesfiber.wtribes_playerdata s ON n.steam_id = s.SteamID
              LEFT JOIN
          tribesfiber.wtribes_tribedata r ON s.TribeID = r.TribeID
              LEFT JOIN
          kalcrosschatfiber.discordsteamlinks t ON n.steam_id = t.SteamId
      WHERE
          s.SteamID = ?
    `;
  } else if (method === 'Player ID') {
    query = `
      SELECT 
          s.CharacterName AS characterName,
          n.player_name AS characterNameFallback,
          n.steam_id AS steamId,
          s.TribeID AS tribeId,
          s.LastMap AS map,
          n.last_login AS lastLogin,
          n.play_time AS playTime,
          r.TribeName AS tribeName,
          t.DiscordId AS discordId
      FROM
          statisticsfiber.personal_stats n
              RIGHT JOIN
          tribesfiber.wtribes_playerdata s ON n.steam_id = s.SteamID
              LEFT JOIN
          tribesfiber.wtribes_tribedata r ON s.TribeID = r.TribeID
              LEFT JOIN
          kalcrosschatfiber.discordsteamlinks t ON n.steam_id = t.SteamId
      WHERE
          s.PlayerID = ?;
    `;
  } else if (method === 'Character') {
    query = `
      SELECT 
          n.steam_id AS steamId,
          s.PlayerID AS playerId,
          s.TribeID AS tribeId,
          s.LastMap AS map,
          n.last_login AS lastLogin,
          n.play_time AS playTime,
          r.TribeName AS tribeName,
          t.DiscordId AS discordId,
          s.CharacterName AS characterName,
          n.player_name AS characterNameFallback
      FROM
          statisticsfiber.personal_stats n
              RIGHT JOIN
          tribesfiber.wtribes_playerdata s ON n.steam_id = s.SteamID
              LEFT JOIN
          tribesfiber.wtribes_tribedata r ON s.TribeID = r.TribeID
              LEFT JOIN
          kalcrosschatfiber.discordsteamlinks t ON n.steam_id = t.SteamId
      WHERE
          s.CharacterName LIKE ?
              OR n.player_name LIKE ?
        `;
  } else if (method === 'Discord ID') {
    query = `
      SELECT 
          s.CharacterName AS characterName,
          n.player_name AS characterNameFallback,
          n.steam_id AS steamId,
          s.TribeID AS tribeId,
          r.TribeName AS tribeName,
          s.PlayerID AS playerId,
          s.LastMap AS map,
          n.last_login AS lastLogin,
          n.play_time AS playTime
      FROM
          statisticsfiber.personal_stats n
              RIGHT JOIN
          tribesfiber.wtribes_playerdata s ON n.steam_id = s.SteamID
              RIGHT JOIN
          kalcrosschatfiber.discordsteamlinks t ON n.steam_id = t.SteamId
              LEFT JOIN
          tribesfiber.wtribes_tribedata r ON s.TribeID = r.TribeID
      WHERE
          t.DiscordId = ?;
    `;
  } else if (method === 'Tribe') {
    query = `
      SELECT 
          n.TribeName AS tribeName,
          n.TribeID AS tribeId,
          s.CharacterName AS characterName,
          t.player_name AS characterNameFallback,
          s.PlayerID AS playerId,
          s.SteamID AS steamId,
          t.play_time as playTime,
          t.last_login as lastLogin,
          r.LastMap as lastMap,
          q.DiscordID as discordId
      FROM
          tribesfiber.wtribes_tribedata n
              RIGHT JOIN
          tribesfiber.wtribes_playerdata s ON n.TribeID = s.TribeID
              LEFT JOIN
          statisticsfiber.personal_stats t ON s.SteamID = t.steam_id
              LEFT JOIN
          tribesfiber.wtribes_playerdata r ON r.PlayerID = s.PlayerID
              LEFT JOIN
          kalcrosschatfiber.discordsteamlinks q ON q.SteamID = s.SteamID
      WHERE
          n.TribeID = ?
              OR n.TribeName LIKE ?;
    `;
  }

  if (method === 'Tribe') {
    const result = (await db(query, [input, `%${input}%`])) as TMethods['Tribe'][number]['members'];
    if (!result || result.length <= 0) return { method, result: [] };

    const tribes: TMethods['Tribe'] = [];

    for (const entry of result) {
      const exist = tribes.find((tribe) => tribe.tribeId === entry.tribeId);
      if (exist) {
        exist.members.push(entry);
      } else {
        tribes.push({
          tribeId: entry.tribeId,
          tribeName: entry.tribeName,
          members: [entry],
        });
      }
    }

    return { method, result: tribes as SearchReturn<T> };
  }

  let result;

  if (method === 'Character') {
    result = (await db(query, [`%${input}%`, `%${input}%`])) as SearchReturn<T>;
  } else {
    result = (await db(query, [input])) as SearchReturn<T>;
  }

  if (!result || result.length <= 0) return { method, result: [] };

  return { method, result };
};
