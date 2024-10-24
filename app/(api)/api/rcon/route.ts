import { _executeRconCommand as executeRconCommand } from '../../../../bot/plugins/rcon/execute';
import { ALL_RCON_COMMANDS } from '../../../../bot/constans';
import crypto from 'node:crypto';

const RCON_API_SECRET = process.env.RCON_API_SECRET;

const handle = async (request: Request) => {
  try {
    const form = await request.formData();

    const data = Object.fromEntries(form);
    const command = data.command as (typeof ALL_RCON_COMMANDS)[number];

    const hash = data.hash;
    const args = data.args;
    const mapNames = data?.map || '';
    const mapHash = Array.isArray(mapNames) ? mapNames.join(',') : '';

    if (typeof hash !== 'string' || typeof args !== 'string') {
      return new Response('Missing args or hash!', { status: 400 });
    }

    const toCheck = command + args + mapHash + RCON_API_SECRET;

    const sha1 = crypto.createHash('sha1');
    sha1.update(toCheck);

    const validHash = sha1.digest('hex');

    if (hash.toLowerCase() !== validHash) {
      return new Response('Hash mismatch!', { status: 401 });
    }

    if (command === 'aac.ban') {
      const executed = await executeRconCommand({
        command,
        args,
        executedBy: 'API_USER',
        mapNames: Array.isArray(mapNames) ? mapNames : undefined,
      });
      return Response.json(executed, { status: 200 });
    } else if (command === 'aac.removeban') {
      const executed = await executeRconCommand({
        command,
        args,
        executedBy: 'API_USER',
        mapNames: Array.isArray(mapNames) ? mapNames : undefined,
      });
      return Response.json(executed, { status: 200 });
    } else if (command === 'punishment.advert.rcon') {
      const executed = await executeRconCommand({
        command,
        args,
        executedBy: 'API_USER',
        mapNames: Array.isArray(mapNames) ? mapNames : undefined,
      });
      return Response.json(executed, { status: 200 });
    } else if (command === 'kmute') {
      const splitArgs = args.split(' ');
      const timeout = splitArgs[1];
      try {
        if (timeout) {
          const parseTimeout = parseInt(timeout);
          if (parseTimeout >= 1) {
            const executed = await executeRconCommand({
              command,
              args,
              executedBy: 'API_USER',
              mapNames: Array.isArray(mapNames) ? mapNames : undefined,
            });
            return Response.json(executed, { status: 200 });
          }
        }
      } catch {}
      return new Response('Invalid args!', { status: 200 });
    } else if (command === 'kunmute') {
      const executed = await executeRconCommand({
        command,
        args,
        executedBy: 'API_USER',
        mapNames: Array.isArray(mapNames) ? mapNames : undefined,
      });
      return Response.json(executed, { status: 200 });
    }

    return new Response('Success!', { status: 200 });
  } catch {
    return new Response('Something went wrong!', { status: 500 });
  }
};

export { handle as POST };
