export type TServerControlResponse = {
  serverId: number;
  status: 'error' | 'success';
};
export type TGetStatusesResponse = {
  serverId: number;
  currentStatus: 'online' | 'offline';
};
export type TApiMethods = 'start' | 'stop' | 'restart' | 'getStatuses';
export type TApiReturn<T extends TApiMethods> = T extends 'getStatuses'
  ? { data: TGetStatusesResponse[]; key: T }
  : { data: TServerControlResponse[]; key: T };
