import crypto from 'node:crypto';

const COMMANDS = ['aac.ban', 'aac.removeban', 'broadcast', 'kmute'] as const;

const RCON_API_SECRET = process.env.RCON_API_SECRET;

const handle = async (request: Request) => {
  try {
    const form = await request.formData();

    const data = Object.fromEntries(form);
    const command = data.command as (typeof COMMANDS)[number];

    if (!COMMANDS.includes(command)) {
      return new Response('Invalid command!', { status: 400 });
    }

    const hash = data.hash;
    const args = data.args;

    if (typeof hash !== 'string' || typeof args !== 'string') {
      return new Response('Missing args or hash!', { status: 400 });
    }

    const toCheck = command + args + RCON_API_SECRET;
    console.log(toCheck);

    const sha1 = crypto.createHash('sha1');
    sha1.update(toCheck);
    const validHash = sha1.digest('hex');

    console.log(hash, validHash);

    if (hash.toLowerCase() !== validHash) {
      return new Response('Hash mismatch!', { status: 401 });
    }

    if (command === 'aac.ban') {
      // TODO
    } else if (command === 'aac.removeban') {
      // TODO
    } else if (command === 'broadcast') {
      // TODO
    } else if (command === 'kmute') {
      // TODO
    }

    return new Response('Success!', { status: 200 });
  } catch {
    return new Response('Something went wrong!', { status: 500 });
  }
};

export { handle as POST };

// TODO API commands
// 1. aac.ban <steamid>
// 2. aac.removeban <steamid>
// 3. broadcast <message>
// 4. kmute <steamid>
