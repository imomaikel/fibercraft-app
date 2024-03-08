export type TServerControlResponse = {
  serverId: number;
  status: 'error' | 'success';
};
export type TGetStatusesResponse = {
  serverId: number;
  currentStatus: 'online' | 'offline';
};
export type TApiMethods = 'START' | 'STOP' | 'RESTART' | 'REFRESH';
export type TApiReturn<T> = T extends 'REFRESH'
  ? { response: TGetStatusesResponse[]; method: T }
  : { response: TServerControlResponse[]; method: T };
