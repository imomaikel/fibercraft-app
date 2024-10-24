export type TEnvVars =
  | 'DISCORD_DEVELOPMENT_BOT_TOKEN'
  | 'DISCORD_PRODUCTION_BOT_TOKEN'
  | 'NODE_ENV'
  | 'DATABASE_ARGS'
  | 'DATABASE_HOST'
  | 'DATABASE_USER'
  | 'DATABASE_PASSWORD'
  | 'DATABASE_SCHEMA';

export const colors = {
  red: 0xeb2f06,
  orange: 0xe58e26,
  blue: 0x3742fa,
  green: 0x2ed573,
  purple: 0xc56cf0,
};

export const extraSigns = {
  zap: '⚡️',
  bookmark: '📑',
};

export const ALL_RCON_COMMANDS = [
  'aac.ban',
  'aac.removeban',
  'punishment.advert.rcon',
  'kmute',
  'kunmute',
  'ListPlayers',
  'KickPlayer',
  'permissions.add',
  'permissions.remove',
  'asm.reload',
  'cryorama.reload',
] as const;

export const numberEmojis = [
  ':one:',
  ':two:',
  ':three:',
  ':four:',
  ':five:',
  ':six:',
  ':seven:',
  ':eight:',
  ':nine:',
  ':one::zero:',
  ':one::one:',
  ':one::two:',
  ':one::three:',
  ':one::four:',
  ':one::five:',
  ':one::six:',
  ':one::seven:',
  ':one::eight:',
  ':one::nine:',
  ':two::zero:',
  ':two::one:',
  ':two::two:',
  ':two::three:',
  ':two::four:',
  ':two::five:',
];
