import { dbGetPairedAccounts } from '../../lib/mysql';

export const _apiGetPairedAccounts = async (searchText: string) => {
  const query = dbGetPairedAccounts(searchText);

  return query;
};
