'use client';
import { TEBEX_FOOTER_PATHS } from '@assets/lib/constans';
import { usePathname } from 'next/navigation';
import { GoDotFill } from 'react-icons/go';
import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
  const pathname = usePathname();

  const showFooter = useMemo(() => {
    return TEBEX_FOOTER_PATHS.some((entry) => (entry === '/' ? pathname === entry : pathname.startsWith(entry)));
  }, [pathname]);

  if (!showFooter) return null;

  return (
    <div className="absolute bottom-0 z-10 flex w-full flex-col">
      <div className="flex items-center justify-end space-x-2 py-0.5 pr-4 text-xs text-muted-foreground">
        <span>© 2024 FiberCraft</span>
        <GoDotFill />
        <div>
          <span>Website made by</span>{' '}
          <Link href="https://github.com/imomaikel" className="underline">
            imomaikel
          </Link>
        </div>
      </div>
      <div className="flex min-h-[35px] w-full flex-col items-center justify-between bg-secondary px-4 py-1 text-[11px] font-normal text-[#B2B2B2] md:flex-row md:px-8 md:py-0">
        {/* Logo and text */}
        <div className="flex h-full items-center">
          <Image src="/tebex.webp" width={54} height={28} alt="tebex" className="hidden md:block" />
          <div className="ml:0 mt-[1px] flex h-full flex-wrap items-center pr-8 md:ml-[32px] md:mt-0 md:pr-0">
            All credit card purchases are handled by Tebex, who handle product fulfillment, billing, support, and
            refunds for all such transactions.
          </div>
        </div>
        {/* Links */}
        <div className="flex h-full items-center pt-[2px] underline">
          <Link href="https://checkout.tebex.io/impressum" className="mr-[14px]">
            Impressum
          </Link>
          <Link href="https://checkout.tebex.io/terms" className="mr-[14px]">
            Terms &amp; Conditions
          </Link>
          <Link href="https://checkout.tebex.io/privacy" className="mr-[14px]">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Footer;
