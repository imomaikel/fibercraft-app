import { TRPCError, initTRPC } from '@trpc/server';
import { ExpressContext } from '../../../server';
import SuperJSON from 'superjson';

const t = initTRPC.context<ExpressContext>().create({
  transformer: SuperJSON,
});
const middleware = t.middleware;

const checkUser = middleware(async ({ next }) => {
  // Auth check here
  // eslint-disable-next-line no-constant-condition
  if (true) {
    return next();
  } else {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(checkUser);