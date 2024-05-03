'use client';
import { useAnimate } from 'framer-motion';
import { Package } from 'tebex_headless';
import { useEffect } from 'react';

type TRandomProducts = {
  hovered: boolean;
  products: Package[];
};
const RandomProducts = ({ hovered, products }: TRandomProducts) => {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    cardsView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!scope.current) return;
    if (hovered) {
      onViewIn();
    } else {
      onViewOut();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hovered, scope.current]);

  const cardsView = () => {
    animate('.temp:nth-child(1)', { rotate: '-50deg', x: -250, y: 0 }, { type: 'spring' });
    animate('.temp:nth-child(2)', { rotate: '-25deg', x: -150, y: -75 }, { type: 'spring' });
    animate('.temp:nth-child(3)', { y: -100 }, { type: 'spring' });
    animate('.temp:nth-child(4)', { rotate: '25deg', x: 150, y: -75 }, { type: 'spring' });
    animate('.temp:nth-child(5)', { rotate: '50deg', x: 250, y: 0 }, { type: 'spring' });
  };

  const onViewOut = () => {
    animate('.temp:nth-child(1)', { rotate: '0deg', x: 0, y: 0 }, { type: 'spring' });
    animate('.temp:nth-child(2)', { rotate: '0deg', x: 0, y: 0 }, { type: 'spring' });
    animate('.temp:nth-child(3)', { y: 0 }, { type: 'spring' });
    animate('.temp:nth-child(4)', { rotate: '0deg', x: 0, y: 0 }, { type: 'spring' });
    animate('.temp:nth-child(5)', { rotate: '0def', x: 0, y: 0 }, { type: 'spring' });

    setTimeout(() => {
      cardsView();
    }, 500);
  };
  const onViewIn = async () => {
    animate('.temp:nth-child(1)', { rotate: '0deg', x: 0, y: 0 }, { type: 'spring' });
    animate('.temp:nth-child(2)', { rotate: '0deg', x: 0, y: 0 }, { type: 'spring' });
    animate('.temp:nth-child(3)', { y: 0 }, { type: 'spring' });
    animate('.temp:nth-child(4)', { rotate: '0deg', x: 0, y: 0 }, { type: 'spring' });
    animate('.temp:nth-child(5)', { rotate: '0def', x: 0, y: 0 }, { type: 'spring' });

    setTimeout(() => {
      animate('.temp:nth-child(1)', { rotate: '0deg', x: '-110%', y: 0 }, { type: 'spring' });
      animate('.temp:nth-child(2)', { rotate: '0deg', x: '50%', y: '-110%' }, { type: 'spring' });
      animate('.temp:nth-child(3)', { y: 0 }, { type: 'spring' });
      animate('.temp:nth-child(4)', { rotate: '0deg', x: '-50%', y: '110%' }, { type: 'spring' });
      animate('.temp:nth-child(5)', { rotate: '0def', x: '110%', y: 0 }, { type: 'spring' });
    }, 750);
  };

  return (
    <div ref={scope} className="relative my-24 flex h-[800px] items-center justify-center border">
      {products.map((entry, idx) => (
        <TempProduct key={entry.id} idx={idx} title={entry.name} />
      ))}
    </div>
  );
};

const TempProduct = ({ idx, title }: { title: string; idx: number }) => {
  return (
    <div className="temp absolute border-2 border-red-500/50 bg-muted p-2">
      <div className="text-sm">{title}</div>
      <div className="flex h-[200px] w-[200px] items-center justify-center text-6xl">{idx + 1}</div>
    </div>
  );
};

export default RandomProducts;
