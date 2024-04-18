'use server';
import { db } from '../../../bot/lib/mysql';

type TMethods = {
  'Steam ID': {
    characterName: string;
    playerId: string;
    tribeId: string;
    tribeName: string;
    discordId: string;
    map: string;
    lastLogin: number;
    playTime: number;
  };
  'Player ID': {
    characterName: string;
    steamId: string;
    tribeId: string;
    tribeName: string;
    discordId: string;
    map: string;
    lastLogin: number;
    playTime: number;
  };
  'Discord ID': {
    characterName: string;
    steamId: string;
    tribeId: string;
    tribeName: string;
    playerId: string;
    map: string;
    lastLogin: number;
    playTime: number;
  };
  Character: {
    steamId: string;
    playerId: string;
    tribeId: string;
    tribeName: string;
    discordId: string;
    map: string;
    lastLogin: number;
    playTime: number;
    characterName: string;
  };
  Tribe: {
    members: {
      characterName: string;
      playerId: string;
      steamId: string;
      tribeName: string;
      playTime: number;
      lastLogin: number;
      map: string;
      tribeId: number;
    }[];
  };
};

type TMethod = keyof TMethods;
type TReturn<T extends TMethod> = TMethods[T];

export const advancedSearch = async <T extends TMethod>(method: T, input: string): Promise<TReturn<T>> => {
  let query = '';

  if (method === 'Steam ID') {
    query = `
      SELECT 
          s.CharacterName AS characterName,
          n.player_id AS playerId,
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
          steam_id = ?
    `;
  } else if (method === 'Player ID') {
    query = `
      SELECT 
          s.CharacterName AS characterName,
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
          player_id = ?;
    `;
  } else if (method === 'Character') {
    query = `
      SELECT 
          n.steam_id AS steamId,
          n.player_id AS playerId,
          s.TribeID AS tribeId,
          s.LastMap AS map,
          n.last_login AS lastLogin,
          n.play_time AS playTime,
          r.TribeName AS tribeName,
          t.DiscordId AS discordId,
          s.CharacterName as characterName
      FROM
          statisticsfiber.personal_stats n
              RIGHT JOIN
          tribesfiber.wtribes_playerdata s ON n.steam_id = s.SteamID
              LEFT JOIN
          tribesfiber.wtribes_tribedata r ON s.TribeID = r.TribeID
              LEFT JOIN
          kalcrosschatfiber.discordsteamlinks t ON n.steam_id = t.SteamId
      WHERE
          s.CharacterName LIKE ?;
    `;
  } else if (method === 'Discord ID') {
    query = `
      SELECT 
          s.CharacterName AS characterName,
          n.steam_id AS steamId,
          s.TribeID AS tribeId,
          r.TribeName AS tribeName,
          n.player_id AS playerId,
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

  const result = method === 'Tribe' ? await db(query, [input, input]) : await db(query, [input]);

  const parsedResult = (result as TReturn<T>) || [];

  return parsedResult;
};
