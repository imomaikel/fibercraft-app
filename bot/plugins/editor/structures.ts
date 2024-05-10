import { dbGetFiberServers } from '../../lib/mysql';
import { readFile } from 'fs/promises';
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
        status: 'With teleporter' | 'Without teleporter' | 'Error';
      }[];
    }
  | {
      method: 'ADD' | 'REMOVE';
      servers: {
        name: string;
        id: number;
        status: 'Success' | 'Error';
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

      successList.push(server.id);
    } catch {
      errorList.push(server.id);
    }
  }

  if (props.method === 'CHECK') {
    return {
      method: 'CHECK',
      servers: servers.map((server) => ({
        id: server.id,
        name: server.mapName,
        status: checkList.includes(server.id)
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
        status: successList.includes(server.id) ? 'Success' : 'Error',
      })),
    };
  }
};
