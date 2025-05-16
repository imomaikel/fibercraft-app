import { dbGetFiberServers } from '../../lib/mysql';
import { readFile, writeFile } from 'fs/promises';
import { executeRconCommand } from '../rcon';
import { client } from '../../client';
import { resolve } from 'path';

type TCryoramaEditorInput =
  | {
      method: 'CHECK';
    }
  | {
      method: 'ADD' | 'REMOVE';
      serverIds: number[];
    };
type TCryoramaEditorOutput =
  | {
      method: 'CHECK';
      servers: {
        name: string;
        id: number;
        isX5: boolean;
        fileStatus: 'With SpaceWhale' | 'Without SpaceWhale' | 'Error';
      }[];
    }
  | {
      method: 'ADD' | 'REMOVE';
      servers: {
        name: string;
        id: number;
        isX5: boolean;
        fileStatus: 'Success' | 'Error';
        rconStatus: boolean;
      }[];
    };

export const _cryoramaEditor = async (props: TCryoramaEditorInput): Promise<TCryoramaEditorOutput> => {
  const servers = (await dbGetFiberServers()).filter((server) => {
    if (props.method === 'CHECK') return true;
    if (props.serverIds.includes(server.id)) return true;
    return false;
  });

  if (!servers || servers.length <= 0) {
    if (props.method === 'CHECK') {
      return { method: 'CHECK', servers: [] };
    } else {
      return { method: props.method, servers: [] };
    }
  }

  const checkList: number[] = [];
  const successList: number[] = [];
  const errorList: number[] = [];

  for (const server of servers) {
    const configPath = resolve(server.path, '..', 'ArkApi', 'Plugins', 'Cryorama', 'config.json');
    try {
      const content = JSON.parse(await readFile(configPath, 'utf8'));

      if (props.method === 'CHECK') {
        if (content.blockedDino.includes('SpaceWhale') || content.blockedDino.includes('Spacewhale')) {
          checkList.push(server.id);
        }
        continue;
      }

      content.blockedDino = content.blockedDino.filter((entry: string) => entry.toLowerCase() !== 'spacewhale');

      if (props.method === 'ADD') {
        content.blockedDino.push('SpaceWhale');
      }

      await writeFile(configPath, JSON.stringify(content, null, 2), { encoding: 'utf-8' });

      successList.push(server.id);
    } catch {
      errorList.push(server.id);
    }
  }

  const reloadCommand = await executeRconCommand({
    command: 'cryorama.reload',
    executedBy: client.user?.username || 'Discord Bot',
  });

  const executedMaps = (reloadCommand.executed || []).map(({ mapName }) => mapName);

  if (props.method === 'CHECK') {
    return {
      method: 'CHECK',
      servers: servers.map((server) => ({
        id: server.id,
        name: server.mapName,
        isX5: server.isX5,
        fileStatus: checkList.includes(server.id)
          ? 'With SpaceWhale'
          : errorList.includes(server.id)
            ? 'Error'
            : 'Without SpaceWhale',
      })),
    };
  } else {
    return {
      method: props.method,
      servers: servers.map((server) => ({
        id: server.id,
        isX5: server.isX5,
        name: server.mapName,
        fileStatus: successList.includes(server.id) ? 'Success' : 'Error',
        rconStatus: executedMaps.includes(server.mapName),
      })),
    };
  }
};
