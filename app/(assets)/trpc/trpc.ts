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

const checkSession = middleware(async ({ ctx, next }) => {
  const { req } = ctx;

  const session = (await getSession({ req })) as NextAuthSession | null;
  if (!session || !session.user.id || !session.user.discordId) throw new TRPCError({ code: 'UNAUTHORIZED' });

  const ipAddress =
    process.env.NODE_ENV === 'development' || process.env.FORCE_PRIVATE_IP_IMPORTANT === 'true'
      ? (process.env.PRIVATE_IP as string)
      : req.headers['x-real-ip'];
  if (!ipAddress || typeof ipAddress !== 'string') throw new TRPCError({ code: 'UNAUTHORIZED' });

  const { user } = session;

  return next({
    ctx: {
      prisma,
      user: {
        ...user,
        ipAddress,
        discordId: user.discordId as string,
      },
    },
  });
});

const publicProcedureContext = middleware(async ({ next, ctx }) => {
  const { req } = ctx;
  const session = (await getSession({ req })) as NextAuthSession | null;

  return next({
    ctx: {
      prisma,
      ...(session?.user && {
        user: {
          ...session.user,
        },
      }),
    },
  });
});

export const router = t.router;
export const publicProcedure = t.procedure.use(publicProcedureContext);
export const managementProcedure = t.procedure.use(checkManagementAccess);
export const userProcedure = t.procedure.use(checkSession);
