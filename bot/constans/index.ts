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

export const POLL_LETTERS = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
] as const;

const EMOJI_LETTERS = [
  '🇦',
  '🇧',
  '🇨',
  '🇩',
  '🇪',
  '🇫',
  '🇬',
  '🇭',
  '🇮',
  '🇯',
  '🇰',
  '🇱',
  '🇲',
  '🇳',
  '🇴',
  '🇵',
  '🇶',
  '🇷',
  '🇸',
  '🇹',
  '🇺',
  '🇻',
  '🇼',
  '🇽',
  '🇾',
  '🇿',
];

export const createRegionalLetterIndicator = (letter: (typeof POLL_LETTERS)[number]) => {
  const index = POLL_LETTERS.findIndex((entry) => entry === letter);
  return EMOJI_LETTERS[index || 0];
};

export const getLetterFromRegionalIndicatorEmoji = (emoji: string) => {
  const index = EMOJI_LETTERS.findIndex((entry) => entry === emoji);

  const letter = typeof index === 'number' ? POLL_LETTERS[index] : undefined;
  return letter;
};
