import { Button } from '@ui/button';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const Discord = () => {
  return (
    <div className="flex items-center justify-center space-x-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Our Discord</h1>
        <p className="text-muted-foreground">A quick way to join the FiberCraft community.</p>
        <Image src="/dino-group.webp" width={600} height={600} alt="dino group" className="my-2 h-96 w-96 rounded-lg" />
        <Button className="mt-2 w-full" asChild>
          <Link href="https://discord.gg/friendly-fibercraft">Join</Link>
        </Button>
      </div>
      <div>
        <iframe
          src="https://discord.com/widget?id=924291148019793980&theme=dark"
          width="350"
          height="500"
          allowTransparency={true}
          sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
        ></iframe>
      </div>
    </div>
  );
};

export default Discord;
