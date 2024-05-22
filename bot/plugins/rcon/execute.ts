import { dbGetFiberServers } from '../../lib/mysql';
import { ALL_RCON_COMMANDS } from '../../constans';
import prisma from '../../lib/prisma';
import { Rcon } from 'rcon-client';

type TExecuteRconCommand = {
  mapNames?: string[] | undefined;
  command: (typeof ALL_RCON_COMMANDS)[number] | { custom: string };
  args?: string;
  executedBy: string;
};
export const _executeRconCommand = async ({ command, mapNames, args = '', executedBy }: TExecuteRconCommand) => {
  let servers = await dbGetFiberServers();

  if (mapNames && mapNames.length >= 1) {
    for (let i = 0; i < mapNames.length; i++) mapNames[i] = mapNames[i].toLowerCase();
    const filteredServers = servers.filter((server) => mapNames.includes(server.mapName.toLowerCase()));
    if (!filteredServers || filteredServers.length <= 0) {
      return { error: true, message: 'Could not find the maps' };
    }
    servers = filteredServers;
  }

  const config = await prisma.config.findFirst();

  if (!config?.rconPassword) {
    return { error: true, message: 'Bad RCON Configuration' };
  }

  const rconWithServer = servers.map((server) => ({
    rcon: new Rcon({
      host: '127.0.0.1',
      port: server.rconPort,
      password: config.rconPassword,
      timeout: 4000,
    }),
    server,
  }));

  const failedToConnect: string[] = [];
  const failedToExecute: string[] = [];
  const executed: { mapName: string; response: string }[] = [];

  if (typeof command === 'object') {
    // @ts-expect-error disabled for autocomplete hints
    command = command.custom;
  }
  const toExecute = `${command} ${args}`;

  const serverList = servers.map(({ mapName }) => mapName).join(', ');

  await prisma.rconLog.create({
    data: {
      command: toExecute,
      executedBy,
      servers: serverList,
    },
  });

  await Promise.all(
    rconWithServer.map(
      async ({ rcon, server: { mapName } }) => await rcon.connect().catch(() => failedToConnect.push(mapName)),
    ),
  );

  await Promise.all(
    rconWithServer
      .filter(({ rcon: { authenticated } }) => authenticated)
      .map(async ({ rcon, server: { mapName } }) => {
        await rcon
          .send(toExecute)
          .then((value) =>
            executed.push({
              response: value,
              mapName,
            }),
          )
          .catch(() => failedToExecute.push(mapName));
      }),
  );

  return {
    success: true,
    failedToConnect,
    failedToExecute,
    executed,
  };
};
