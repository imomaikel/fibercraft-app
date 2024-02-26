import { COMMANDS } from '../../constans';
import prisma from '../../lib/prisma';
import { Rcon } from 'rcon-client';

type TExecuteRconCommand = {
  serverId?: number;
  command: (typeof COMMANDS)[number];
  args: string;
  executedBy: string;
};
export const _executeRconCommand = async ({ command, serverId, args, executedBy }: TExecuteRconCommand) => {
  if (!COMMANDS.includes(command) || !args) {
    return { error: true, message: 'Invalid request!' };
  }

  const servers = await prisma.server.findMany({
    ...(typeof serverId == 'number' && {
      where: {
        id: serverId,
      },
    }),
  });
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
