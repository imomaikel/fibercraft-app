import { TApiMethods, TApiReturn } from './types';

type TServerControlApi = {
  serverId: number | 'all';
};
export const _serverControlApi = async <T extends TApiMethods>(method: T, { serverId }: TServerControlApi) => {
  try {
    const request = (await fetch('http://127.0.0.1:3201/api/manager', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        command: method.toLowerCase(),
        ...(method !== 'getStatuses' &&
          typeof serverId === 'number' && {
            serverId,
          }),
      }),
    }).then((res) => res.json())) as TApiReturn<T>;
    request.key = method;

    if (request.key === 'getStatuses') {
      return { success: true, method: 'getStatuses', statuses: request.data };
    }
    return { success: true, method, responses: request.data };
  } catch {
    return { error: true };
  }
};
