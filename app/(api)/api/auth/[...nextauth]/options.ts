import DiscordProvider from 'next-auth/providers/discord';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { NextAuthOptions } from 'next-auth';
import prisma from '@assets/lib/prisma';

const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/',
  },
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_OAUTH2_CLIENT_ID!,
      clientSecret: process.env.DISCORD_OAUTH2_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session: async ({ session, token }) => {
      if (!session.user) return session;

      const getUserData = await prisma.user.findUnique({
        where: { id: token.uid },
        include: { permissions: true },
      });

      if (getUserData?.discordId) {
        session.user.discordId = getUserData.discordId;
      }

      if (!getUserData?.discordId) {
        await prisma.user.update({
          where: { id: token.uid },
          data: { discordId: token.discordId },
        });
      }
      if (getUserData && getUserData.permissions.length <= 0) {
        await prisma.user.update({
          where: { id: token.uid },
          data: {
            permissions: {
              create: {
                permission: 'USER',
              },
            },
          },
        });
      }
      if (session.user.image?.includes('https') && getUserData?.image !== session.user.image) {
        await prisma.user.update({
          where: { id: token.uid },
          data: { image: session.user.image },
        });
      }

      const permissions = getUserData?.permissions.map(({ permission }) => permission);
      session.user.permissions = permissions;
      token.permissions = permissions;

      session.user.selectedDiscordId = getUserData?.selectedDiscordId || undefined;
      token.selectedDiscordId = getUserData?.selectedDiscordId || undefined;

      return session;
    },
    jwt: async ({ token, user, account }) => {
      if (!user || !account) return token;

      if ((!token.permissions || !token.selectedDiscordId) && token.uid) {
        const getUserData = await prisma.user.findUnique({
          where: { id: token.uid },
          include: { permissions: true },
        });
        const permissions = getUserData?.permissions.map((entry) => entry.permission);
        token.permissions = permissions;
        token.selectedDiscordId = getUserData?.selectedDiscordId || undefined;
      }

      token.discordId = account.providerAccountId;
      token.uid = user.id;
      return token;
    },
  },
};

export default authOptions;
