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
