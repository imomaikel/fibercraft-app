'use client';
import { useMobileNavbar } from '@assets/hooks/useMobileNavbar';
import { GiHamburgerMenu } from 'react-icons/gi';
import { usePathname } from 'next/navigation';
import CartButton from './cart/CartButton';
import { Separator } from '@ui/separator';
import UserProfile from './UserProfile';
import NavLinks from './NavLinks';
import Image from 'next/image';
import Link from 'next/link';

const Navbar = () => {
  const { openMobileNav } = useMobileNavbar();
  const pathname = usePathname();

  const showCartButton = !pathname.startsWith('/management');

  return (
    <div className="fixed left-0 z-50 h-20 w-screen bg-background/50 px-1 backdrop-blur-sm sm:px-4">
      <div className="relative mx-auto flex h-full w-full max-w-screen-2xl items-center border-b">
        <header className="w-full">
          <nav>
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-6">
                <div className="md:hidden" role="button" aria-labelledby="open sidebar" onClick={openMobileNav}>
                  <GiHamburgerMenu className="h-8 w-8" />
                </div>
                <Link
                  href={
                    pathname.startsWith('/') ? '/store' : pathname.startsWith('/dashboard') ? '/store' : '/dashboard'
                  }
                >
                  <div className="group relative flex h-16 items-center md:px-4">
                    <Image
                      alt="logo"
                      src="/fiber.webp"
                      className="hidden md:block"
                      quality={100}
                      width={48}
                      height={48}
                    />
                    <h1 className="text-xl font-extrabold antialiased sm:tracking-wide md:ml-4 md:text-3xl">
                      FiberCraft
                    </h1>
                    <div className="absolute inset-0 -z-10 hidden rounded-full bg-gradient-to-l from-muted/50 to-primary/50 opacity-50 md:block" />
                  </div>
                </Link>
                <div className="hidden md:block">
                  <NavLinks />
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
