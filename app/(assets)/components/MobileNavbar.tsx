'use client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@ui/sheet';
import { useMobileNavbar } from '@assets/hooks/useMobileNavbar';
import NavLinks from './NavLinks';

const MobileNavbar = () => {
  const { closeMobileNav, isMobileNavOpen } = useMobileNavbar();

  return (
    <Sheet open={isMobileNavOpen} onOpenChange={closeMobileNav}>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <div className="mt-4 flex w-full ">
          <NavLinks className="flex w-full flex-col" />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavbar;
