'use client';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuListItem,
  NavigationMenuTrigger,
} from '@ui/navigation-menu';
import { useCurrentUser } from '@assets/hooks/useCurrentUser';
import { NAV_LINKS } from '@assets/lib/constans';
import { usePathname } from 'next/navigation';
import { cn } from '@assets/lib/utils';
import { useMemo } from 'react';
import Link from 'next/link';

type TNavLinks = {
  className?: string;
};
const NavLinks = ({ className }: TNavLinks) => {
  const { user } = useCurrentUser();

  const userPermissions = user?.permissions;
  const userSelectedGuildId = user?.selectedDiscordId;

  const pathname = usePathname();

  const navLinksWithAccess = useMemo(() => {
    if (!userPermissions) return [];
    return NAV_LINKS.map((parent) => {
      if (!parent.itemsOnHover) return parent;

      const childrenAccess = (
        parent.itemsOnHover.map((children) => {
          if (children.path !== '/management/discord-selection' && !userSelectedGuildId) return null;
          const hasAccess = userPermissions.some(
            (userPermission) => userPermission === children.permission || userPermission === 'ALL_PERMISSIONS',
          );
          return hasAccess ? children : null;
        }) ?? []
      ).filter((hasAccess) => hasAccess);

      if (childrenAccess.length <= 0) return null;

      return { ...parent, itemsOnHover: childrenAccess };
    }).filter((hasAccess) => hasAccess);
  }, [userPermissions, userSelectedGuildId]);

  return (
    <NavigationMenu delayDuration={100}>
      <NavigationMenuList className={className}>
        <NavigationMenuItem>
          <Link
            href="/"
            className="group inline-flex h-9 cursor-pointer
           items-center justify-center rounded-md bg-background/50 px-4 py-2
            text-sm font-medium transition-colors hover:bg-accent
            hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
          >
            Home
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link
            href="/store"
            className="group inline-flex h-9 cursor-pointer
           items-center justify-center rounded-md bg-background/50 px-4 py-2
            text-sm font-medium transition-colors hover:bg-accent
            hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
          >
            Store
          </Link>
        </NavigationMenuItem>
        {navLinksWithAccess.map((entry) => {
          if (!entry) return null;

          return (
            <NavigationMenuItem key={entry.label}>
              <NavigationMenuTrigger className="bg-background/50">{entry.label}</NavigationMenuTrigger>
              <NavigationMenuContent className="max-h-[60vh] max-w-[calc(100vw-48px)] overflow-y-auto md:w-auto">
                <ul className="grid w-[400px] max-w-[calc(100vw-48px)] gap-3 p-4 md:w-[500px] md:max-w-none md:grid-cols-2 lg:w-[600px]">
                  {entry.itemsOnHover.map((children) => {
                    if (!children) return null;
                    return (
                      <NavigationMenuListItem
                        key={children.label}
                        title={children.label}
                        href={children.path}
                        className={cn(pathname.startsWith(children.path) && 'ring-1', 'h-full')}
                      >
                        {children.description}
                      </NavigationMenuListItem>
                    );
                  })}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default NavLinks;
