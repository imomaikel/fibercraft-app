'use client';

import Image from 'next/image';

const Events = () => {
  return (
    <div className="relative w-full max-w-4xl rounded-lg border">
      <div className="absolute -right-10 bottom-0 z-10 w-1/2 select-none">
        <Image src="/ev3.png" alt="" width={0} height={0} sizes="100vw" className="max-h-60 w-auto" />
      </div>
      <div className="relative h-48 overflow-hidden rounded-lg">
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
      <div className="absolute left-0 top-0 h-full w-1/2">
        <div className="relative h-full w-full">
          {/*  */}
          {/*  */}
        </div>
      </div>
    </div>
  );
};

export default Events;
