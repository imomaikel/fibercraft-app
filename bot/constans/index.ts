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
};

export const COMMANDS = ['aac.ban', 'aac.removeban', 'broadcast', 'kmute'] as const;
