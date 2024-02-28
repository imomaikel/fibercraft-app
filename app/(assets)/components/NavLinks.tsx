'use client';
import {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuListItem,
} from '@ui/navigation-menu';
import { NAV_LINKS } from '@assets/lib/constans';
import Link from 'next/link';
import React from 'react';

const NavLinks = () => {
  return (
    <NavigationMenu delayDuration={100}>
      <NavigationMenuList>
        {NAV_LINKS.map((entry) => {
          if (!entry.itemsOnHover?.length) {
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
                  {entry.itemsOnHover.map((children) => (
                    <NavigationMenuListItem key={children.label} title={children.label} href={children.path}>
                      {children.description}
                    </NavigationMenuListItem>
                  ))}
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
