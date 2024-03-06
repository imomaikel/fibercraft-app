'use client';
import { useMobileNavbar } from '@assets/hooks/useMobileNavbar';
import NavbarLinksAccess from './NavbarLinksAccess';
import { GiHamburgerMenu } from 'react-icons/gi';
import { usePathname } from 'next/navigation';
import { Separator } from '@ui/separator';
import UserProfile from './UserProfile';
import CartButton from './CartButton';
import Image from 'next/image';
import Link from 'next/link';

const Navbar = () => {
  const { openMobileNav } = useMobileNavbar();
  const pathname = usePathname();

  const showCartButton = !pathname.startsWith('/management');

  return (
    <div className="fixed left-0 z-50 h-16 w-screen bg-background/40 px-1 backdrop-blur-sm sm:px-4">
      <div className="relative mx-auto flex h-full w-full max-w-screen-xl items-center border-b">
        <header className="w-full">
          <nav>
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-6">
                <div className="md:hidden" role="button" aria-labelledby="open sidebar" onClick={openMobileNav}>
                  <GiHamburgerMenu className="h-8 w-8" />
                </div>
                <Link href="/dashboard">
                  <div className="group flex items-center">
                    <Image
                      alt="logo"
                      src="/fiber.webp"
                      width={54}
                      height={54}
                      className="absolute -z-10 -translate-x-2 -translate-y-1 md:-translate-x-4"
                    />
                    <h1 className="ml-4 text-xl font-bold antialiased sm:tracking-wide md:ml-2 md:text-3xl">
                      Fibercraft
                    </h1>
                  </div>
                </Link>
                <div className="hidden md:block">
                  <NavbarLinksAccess />
                </div>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-3">
                <div>
                  <UserProfile />
                </div>
                {showCartButton && (
                  <>
                    <Separator orientation="vertical" className="h-10" />
                    <div>
                      <CartButton />
                    </div>
                  </>
                )}
              </div>
            </div>
          </nav>
        </header>
      </div>
    </div>
  );
};

export default Navbar;
