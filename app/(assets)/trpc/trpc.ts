import { NextAuthSession } from '../../../next-auth';
import { TRPCError, initTRPC } from '@trpc/server';
import { ExpressContext } from '../../../server';
import { getSession } from 'next-auth/react';
import prisma from '../lib/prisma';
import SuperJSON from 'superjson';

const t = initTRPC.context<ExpressContext>().create({
  transformer: SuperJSON,
});
const middleware = t.middleware;

const checkManagementAccess = middleware(async ({ ctx, next }) => {
  const { req } = ctx;
  const session = (await getSession({ req })) as NextAuthSession | null;
  if (!session) throw new TRPCError({ code: 'UNAUTHORIZED' });

  const { user } = session;
  if (
    !(req.path === '/management.getGuilds' || req.path === '/management.selectGuild') &&
    (!user.selectedDiscordId || !user.discordId)
  ) {
    throw new TRPCError({ code: 'BAD_REQUEST' });
  }
  if (!user.permissions || user.permissions.length === 0) throw new TRPCError({ code: 'UNAUTHORIZED' });
  if (user.permissions.length === 1 && user.permissions[0] === 'USER') throw new TRPCError({ code: 'UNAUTHORIZED' });

  return next({
    ctx: {
      prisma,
      user: {
        ...user,
        discordId: user.discordId as string,
        selectedDiscordId: user.selectedDiscordId as string,
      },
      userPermissions: user.permissions,
    },
  });
});

// TODO procedures
export const router = t.router;
export const publicProcedure = t.procedure;
export const managementProcedure = t.procedure.use(checkManagementAccess);
