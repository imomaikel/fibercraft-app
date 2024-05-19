import MarketingSectionWrapper from './MarketingSectionWrapper';
import { Button } from '@ui/button';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const Discord = () => {
  return (
    <MarketingSectionWrapper
      title="Our Discord"
      description="A quick way to join the FiberCraft community."
      theme="GRAY"
    >
      <div className="flex flex-col items-center justify-center space-y-6 md:flex-row md:space-x-6 md:space-y-0">
        <div className="text-center">
          <h2 className="text-2xl font-medium tracking-wide">Let&apos;s talk</h2>
          <Image
            src="/dino-group.webp"
            width={384}
            height={384}
            alt="dino group"
            className="my-2 h-96 w-96 rounded-lg"
          />
          <Button className="mt-2 w-full" asChild>
            <Link href="https://discord.gg/friendly-fibercraft">Join</Link>
          </Button>
        </div>
        <div>
          <iframe
            title="Discord"
            src="https://discord.com/widget?id=924291148019793980&theme=dark"
            width="350"
            height="500"
            sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
          ></iframe>
        </div>
      </div>
    </MarketingSectionWrapper>
  );
};

export default Discord;
