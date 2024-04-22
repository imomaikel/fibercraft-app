'use client';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuListItem,
  NavigationMenuTrigger,
} from '@ui/navigation-menu';
import { ManagementPermission } from '@prisma/client';
import { NAV_LINKS } from '@assets/lib/constans';
import { usePathname } from 'next/navigation';
import { cn } from '@assets/lib/utils';
import { useMemo } from 'react';

type TNavLinks = {
  userPermissions: ManagementPermission[];
  userSelectedGuildId: string | undefined;
};
const NavLinks = ({ userPermissions, userSelectedGuildId }: TNavLinks) => {
  const pathname = usePathname();

  const navLinksWithAccess = useMemo(() => {
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
      <NavigationMenuList>
        {navLinksWithAccess.map((entry) => {
          if (!entry) return null;

          return (
            <NavigationMenuItem key={entry.label}>
              <NavigationMenuTrigger>{entry.label}</NavigationMenuTrigger>
              <NavigationMenuContent className="max-h-[80vh] max-w-[calc(100vw-48px)] overflow-y-auto md:w-auto">
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
