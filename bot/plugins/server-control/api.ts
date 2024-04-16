import { TApiMethods, TApiReturn } from './types';

type TServerControlApi = {
  serverId: number | 'all';
};
export const _serverControlApi = async <T extends TApiMethods>(method: T, { serverId }: TServerControlApi) => {
  try {
    const response = (await fetch('http://127.0.0.1:3201/api/manager', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        command: method.toLowerCase(),
        ...(method !== 'REFRESH' &&
          typeof serverId === 'number' && {
            serverId,
          }),
      }),
    }).then((res) => res.json())) as TApiReturn<T>;

    return { success: true, response };
  } catch {
    return { error: true };
  }
};
