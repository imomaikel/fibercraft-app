'use client';
import MarketingSectionWrapper from './MarketingSectionWrapper';
import { useEventListener } from 'usehooks-ts';
import { useEffect, useState } from 'react';
import { useAnimate } from 'framer-motion';
import { trpc } from '@trpc/index';
import Image from 'next/image';
import Link from 'next/link';

const StorePreview = () => {
  const { data: randomProducts, isLoading } = trpc.publicRouter.getRandomProducts.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const [hovered, setHovered] = useState(false);
  const [scope, animate] = useAnimate();

  useEffect(() => {
    if (randomProducts) {
      cardsView();
      onResize();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [randomProducts]);

  const onResize = () => {
    if (window.innerWidth <= 768 && scope.current) {
      animate('.randomProduct:nth-child(1)', { rotate: '0deg', x: 0, y: 0 }, { type: 'spring' });
      animate('.randomProduct:nth-child(2)', { rotate: '0deg', x: 0, y: 0 }, { type: 'spring' });
      animate('.randomProduct:nth-child(3)', { y: 0 }, { type: 'spring' });
      animate('.randomProduct:nth-child(4)', { rotate: '0deg', x: 0, y: 0 }, { type: 'spring' });
      animate('.randomProduct:nth-child(5)', { rotate: '0deg', x: 0, y: 0 }, { type: 'spring' });
    } else if (scope.current) {
      cardsView();
      setHovered(false);
    }
  };
  useEventListener('resize', onResize);

  const onMouseEnter = () => {
    if (!hovered) {
      setHovered(true);
      onViewIn();
    }
  };

  const cardsView = () => {
    animate('.randomProduct:nth-child(1)', { rotate: '-50deg', x: -250, y: 0 }, { type: 'spring' });
    animate('.randomProduct:nth-child(2)', { rotate: '-25deg', x: -150, y: -75 }, { type: 'spring' });
    animate('.randomProduct:nth-child(3)', { y: -100 }, { type: 'spring' });
    animate('.randomProduct:nth-child(4)', { rotate: '25deg', x: 150, y: -75 }, { type: 'spring' });
    animate('.randomProduct:nth-child(5)', { rotate: '50deg', x: 250, y: 0 }, { type: 'spring' });
  };

  const onViewIn = async () => {
    animate('.randomProduct:nth-child(1)', { rotate: '0deg', x: 0, y: 0 }, { type: 'spring' });
    animate('.randomProduct:nth-child(2)', { rotate: '0deg', x: 0, y: 0 }, { type: 'spring' });
    animate('.randomProduct:nth-child(3)', { y: 0 }, { type: 'spring' });
    animate('.randomProduct:nth-child(4)', { rotate: '0deg', x: 0, y: 0 }, { type: 'spring' });
    animate('.randomProduct:nth-child(5)', { rotate: '0deg', x: 0, y: 0 }, { type: 'spring' });

    setTimeout(() => {
      animate('.randomProduct:nth-child(1)', { rotate: '0deg', x: '-110%', y: 0 }, { type: 'spring' });
      animate('.randomProduct:nth-child(2)', { rotate: '0deg', x: '50%', y: '-110%' }, { type: 'spring' });
      animate('.randomProduct:nth-child(3)', { y: 0 }, { type: 'spring' });
      animate('.randomProduct:nth-child(4)', { rotate: '0deg', x: '-50%', y: '110%' }, { type: 'spring' });
      animate('.randomProduct:nth-child(5)', { rotate: '0deg', x: '110%', y: 0 }, { type: 'spring' });
    }, 750);
  };

  if (!randomProducts || isLoading) return null;

  return (
    <MarketingSectionWrapper title="Online Store" description="In need of some in-game points?" theme="GRAY">
      <div
        ref={scope}
        className="my-s relative flex min-h-[800px] flex-wrap items-center justify-center gap-6 md:flex-row md:gap-0 md:space-y-0 "
        onMouseEnter={onMouseEnter}
      >
        {randomProducts.map((entry) => (
          <Link
            className="randomProduct relative rounded-md border border-white/50 bg-muted p-2 transition-colors hover:border-primary md:absolute"
            key={`random-${entry.id}`}
            href={`/store/${entry.id}`}
          >
            <span className="text-lg font-semibold">{entry.name}</span>
            <div className="flex h-[200px] w-[200px] items-center justify-center">
              <Image
                src={entry.image || '/empty.png'}
                alt={`${entry.name} image`}
                width={200}
                height={200}
                className="h-auto w-auto rounded-md"
              />
            </div>
          </Link>
        ))}
      </div>
    </MarketingSectionWrapper>
  );
};

export default StorePreview;
