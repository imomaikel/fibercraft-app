import { dbGetFiberServers } from '../../lib/mysql';

export const _apiGetServers = async () => {
  const servers = await dbGetFiberServers();
  return servers;
};
