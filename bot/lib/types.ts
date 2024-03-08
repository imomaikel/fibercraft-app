export type TDbGetNewTribeLogs = {
  id: number;
  tribeId: number;
  tribeName: string | null;
  content: string;
  timestamp: Date;
}[];

export type TDbGetPairedAccounts = {
  steamId: string;
  playerName: string;
}[];

export type TDbGetFiberServers = {
  id: number;
  mapName: string;
  path: string;
  gameMode: string;
  gameType: string;
  autoRestart: number;
  customName: string | null;
  multiHome: string | null;
  queryPort: number;
  rconPort: number;
  lastStatus: string;
  lastPlayers: number;
  position: number;
  serverName: string;
}[];
