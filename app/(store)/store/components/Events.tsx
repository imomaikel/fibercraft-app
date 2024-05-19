'use client';

import Image from 'next/image';

const Events = () => {
  return (
    <div className="relative h-fit w-full max-w-4xl rounded-lg border">
      <div className="absolute -right-10 bottom-0 z-10 hidden select-none md:block">
        <Image src="/ev3.png" alt="" width={0} height={0} sizes="100vw" className="w-auto md:h-60" />
      </div>
      <div className="relative h-36 overflow-hidden rounded-lg md:h-48">
        <Image
          alt="background"
          className="h-full w-full object-cover blur-sm"
          quality={10}
          src="/bg.jpg"
          sizes="100vw"
          width={0}
          height={0}
        />
        <div className="absolute inset-0 h-full w-full bg-black/50" />
      </div>
      <div className="absolute left-0 top-0 h-full w-full md:w-1/2">
        <div className="relative flex h-full w-full items-center justify-center px-4 text-center">
          <p className="text-2xl font-medium">View our amazing packages and have fun with them!</p>
        </div>
      </div>
    </div>
  );
};

export default Events;
