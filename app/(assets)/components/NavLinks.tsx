'use client';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuListItem,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@ui/navigation-menu';
import { ManagementPermission } from '@prisma/client';
import { NAV_LINKS } from '@assets/lib/constans';
import { useMemo } from 'react';
import Link from 'next/link';

type TNavLinks = {
  userPermissions: ManagementPermission[];
};
const NavLinks = ({ userPermissions }: TNavLinks) => {
  const navLinksWithAccess = useMemo(() => {
    return NAV_LINKS.map((parent) => {
      if (!parent.itemsOnHover) return parent;

      const childrenAccess = (
        parent.itemsOnHover.map((children) => {
          const hasAccess = userPermissions.some(
            (userPermission) => userPermission === children.permission || userPermission === 'ALL_PERMISSIONS',
          );
          return hasAccess ? children : null;
        }) ?? []
      ).filter((hasAccess) => hasAccess);

      if (childrenAccess.length <= 0) return null;

      return { ...parent, itemsOnHover: childrenAccess };
    }).filter((hasAccess) => hasAccess);
  }, [userPermissions]);

  return (
    <NavigationMenu delayDuration={100}>
      <NavigationMenuList>
        {navLinksWithAccess.map((entry) => {
          if (!entry) return null;
          if (!entry.itemsOnHover) {
            return (
              <NavigationMenuItem key={entry.label}>
                <Link href={entry.redirectOnClick} legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>{entry.label}</NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            );
          }

          return (
            <NavigationMenuItem key={entry.label}>
              <NavigationMenuTrigger>{entry.label}</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                  {entry.itemsOnHover.map((children) => {
                    if (!children) return null;
                    return (
                      <NavigationMenuListItem key={children.label} title={children.label} href={children.path}>
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
