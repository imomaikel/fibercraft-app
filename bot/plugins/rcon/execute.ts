import { dbGetFiberServers } from '../../lib/mysql';
import { ALL_RCON_COMMANDS } from '../../constans';
import prisma from '../../lib/prisma';
import { Rcon } from 'rcon-client';

type TExecuteRconCommand = {
  serverMapName?: string | undefined;
  command: (typeof ALL_RCON_COMMANDS)[number];
  args?: string;
  executedBy: string;
};
export const _executeRconCommand = async ({ command, serverMapName, args = '', executedBy }: TExecuteRconCommand) => {
  if (!ALL_RCON_COMMANDS.includes(command) || !args) {
    return { error: true, message: 'Invalid request!' };
  }

  let servers = await dbGetFiberServers();

  if (typeof serverMapName === 'string' && serverMapName.length >= 2) {
    const singleServer = servers.find((server) => server.mapName.toLowerCase().includes(serverMapName.toLowerCase()));
    if (!singleServer) {
      return { error: true, message: 'Could not find the server' };
    }
    servers = [singleServer];
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

  const toExecute = `${command} ${args}`;

  await prisma.rconLog.create({
    data: {
      command: toExecute,
      executedBy,
      servers: servers.map(({ mapName }) => mapName).join(', '),
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
