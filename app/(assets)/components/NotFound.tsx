'use client';
import { cn } from '@assets/lib/utils';
import { Button } from '@ui/button';
import Image from 'next/image';
import Link from 'next/link';

type TNotFound = {
  text?: string;
  className?: string;
};
const NotFound = ({ className, text = 'This page could not be found.' }: TNotFound) => {
  return (
    <div className={cn('mt-12 flex w-full items-center justify-center', className)}>
      <div className="relative flex flex-col items-center rounded-lg bg-muted/50 md:flex-row">
        <div>
          <Image
            alt="lost"
            src="/lost.webp"
            width={250}
            height={250}
            className="h-[250px] w-[250px] rounded-tl-lg rounded-tr-lg md:rounded-bl-lg md:rounded-tr-none"
          />
        </div>
        <div className="flex flex-col py-4 text-center md:px-8">
          <h2 className="text-xl font-bold">Not Found</h2>
          <p className="text-sm text-muted-foreground">{text}</p>

          <div className="mt-4 flex flex-col space-y-2">
            <Button asChild variant="secondary">
              <Link href="/">Return Home</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/store">Return Store</Link>
            </Button>
          </div>
        </div>
        <div className="absolute -z-10 h-full w-1/4 rotate-45 bg-gradient-to-r from-yellow-600 to-red-600 blur-[125px]" />
      </div>
    </div>
  );
};

export default NotFound;
