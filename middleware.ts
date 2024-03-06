import { getPermissionFromPath } from '@assets/lib/utils';
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const path = req.url.substring(req.url.indexOf('/management')).split('/').slice(0, 3).join('/');
    const pathData = getPermissionFromPath(path);
    const userPermissions = req.nextauth.token?.permissions;

    if (!userPermissions || !pathData) return NextResponse.redirect(new URL('/', req.url));
    if (!userPermissions.includes(pathData.permission) && !userPermissions.includes('ALL_PERMISSIONS')) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    if (pathData.label !== 'Discord Selection' && !req.nextauth.token?.selectedDiscordId) {
      return NextResponse.redirect(new URL('/management/discord-selection', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        if (!token?.permissions || token?.permissions.length === 0) return false;
        if (token?.permissions?.length === 1 && token.permissions[0] === 'USER') return false;
        return true;
      },
    },
  },
);

export const config = { matcher: ['/management/:path*'] };
