'use client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@ui/sheet';
import { useMobileNavbar } from '@assets/hooks/useMobileNavbar';
import NavbarLinksAccess from './NavbarLinksAccess';

const MobileNavbar = () => {
  const { closeMobileNav, isMobileNavOpen } = useMobileNavbar();

  return (
    <Sheet open={isMobileNavOpen} onOpenChange={closeMobileNav}>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <NavbarLinksAccess />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavbar;
