import { ManagementPermission, StoreMethod } from '@prisma/client';
import { DefaultSession } from 'next-auth';

interface NextAuthUser {
  id?: string;
  discordId?: string;
  basketIdent?: string | null;
  basketAuthUrl?: string | null;
  selectedDiscordId?: string;
  permissions?: ManagementPermission[];
  storeMethod?: StoreMethod;
  epicId?: string | null;
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
    selectedDiscordId?: string;
    uid?: string;
    permissions?: ManagementPermission[];
  }
}
