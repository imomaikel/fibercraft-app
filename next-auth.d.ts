import { DefaultSession } from 'next-auth';
import { ManagementPermission } from '@prisma/client';

interface NextAuthUser {
  id?: string;
  discordId?: string;
  selectedDiscordId?: string;
  permissions?: ManagementPermission[];
}
export interface NextAuthSession {
  user: NextAuthUser & DefaultSession['user'];
}

declare module 'next-auth/core/types' {
  interface Session {
    user: NextAuthUser & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    discordId?: string;
    uid?: string;
  }
}
