import { dbGetFiberServers } from '../../lib/mysql';
import { readFile, writeFile } from 'fs/promises';
import { executeRconCommand } from '../rcon';
import { client } from '../../client';
import { resolve } from 'path';

type TStructuresEditorInput =
  | {
      method: 'CHECK';
    }
  | {
      method: 'ADD' | 'REMOVE';
      serverIds: number[];
    };
type TStructuresEditorOutput =
  | {
      method: 'CHECK';
      servers: {
        name: string;
        id: number;
        fileStatus: 'With teleporter' | 'Without teleporter' | 'Error';
      }[];
    }
  | {
      method: 'ADD' | 'REMOVE';
      servers: {
        name: string;
        id: number;
        fileStatus: 'Success' | 'Error';
        rconStatus: boolean;
      }[];
    };

export const _structuresEditor = async (props: TStructuresEditorInput): Promise<TStructuresEditorOutput> => {
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
    const configPath = resolve(server.path, '..', 'ArkApi', 'Plugins', 'AntiStructureMesh', 'config.json');
    try {
      const content = JSON.parse(await readFile(configPath, 'utf8'));

      if (props.method === 'CHECK') {
        if (
          content.AntiStructureMesh.DetectedStructures.includes('Tek Teleporter') &&
          content.AntiStructureMesh.Structures_Collision.includes('Tek Teleporter')
        ) {
          checkList.push(server.id);
        }
        continue;
      }

      content.AntiStructureMesh.DetectedStructures = content.AntiStructureMesh.DetectedStructures.filter(
        (entry: string) => entry !== 'Tek Teleporter',
      );
      content.AntiStructureMesh.Structures_Collision = content.AntiStructureMesh.Structures_Collision.filter(
        (entry: string) => entry !== 'Tek Teleporter',
      );
      if (props.method === 'ADD') {
        content.AntiStructureMesh.Structures_Collision.push('Tek Teleporter');
        content.AntiStructureMesh.DetectedStructures.push('Tek Teleporter');
      }

      await writeFile(configPath, JSON.stringify(content, null, 2), { encoding: 'utf-8' });

      successList.push(server.id);
    } catch {
      errorList.push(server.id);
    }
  }

  const reloadCommand = await executeRconCommand({
    command: 'asm.reload',
    executedBy: client.user?.username || 'Discord Bot',
  });

  const executedMaps = (reloadCommand.executed || []).map(({ mapName }) => mapName);

  if (props.method === 'CHECK') {
    return {
      method: 'CHECK',
      servers: servers.map((server) => ({
        id: server.id,
        name: server.mapName,
        fileStatus: checkList.includes(server.id)
          ? 'With teleporter'
          : errorList.includes(server.id)
            ? 'Error'
            : 'Without teleporter',
      })),
    };
  } else {
    return {
      method: props.method,
      servers: servers.map((server) => ({
        id: server.id,
        name: server.mapName,
        fileStatus: successList.includes(server.id) ? 'Success' : 'Error',
        rconStatus: executedMaps.includes(server.mapName),
      })),
    };
  }
};
