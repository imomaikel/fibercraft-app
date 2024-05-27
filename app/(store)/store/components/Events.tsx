'use client';
import { useEffect, useState } from 'react';
import { cn } from '@assets/lib/utils';
import { motion } from 'framer-motion';
import { trpc } from '@trpc/index';
import Image from 'next/image';

const Events = () => {
  const { data } = trpc.publicRouter.getEvents.useQuery(undefined, { refetchOnWindowFocus: false });
  const [activeIndex, setActiveIndex] = useState(0);

  const extraEvents = data || [];

  const events: { id: number; text: string }[] = [
    {
      id: 0,
      text: 'View our amazing packages and have fun with them!',
    },
    ...extraEvents,
  ];

  const eventsLen = events.length;
  const event = events[activeIndex];

  const handleChange = (newIndex: number) => {
    setActiveIndex(newIndex);
  };

  const nextEvent = () => {
    const newIndex = activeIndex + 1;
    if (events[newIndex]) {
      setActiveIndex(newIndex);
    } else {
      setActiveIndex(0);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(nextEvent, 4_000);
    return () => {
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

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
      <div className="absolute -top-3 left-0 flex h-2 w-fit space-x-2 md:max-w-[50%]">
        {Array.from(Array(eventsLen).keys()).map((idx) => (
          <div
            key={`event-switch-${idx}`}
            className={cn(
              'h-2 w-8 rounded-xl bg-primary/50 transition-colors',
              idx === activeIndex && 'bg-primary',
              'hover:bg-primary',
            )}
            role="button"
            aria-label="switch event"
            onClick={() => handleChange(idx)}
          />
        ))}
      </div>
      <div className="absolute left-0 top-0 h-full w-full md:w-1/2">
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden px-4 text-center">
          <motion.p
            key={`active-${activeIndex}`}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: [25, -25, 0] }}
            className="text-xl font-medium"
            transition={{
              duration: 0.5,
            }}
          >
            {event.text}
          </motion.p>
        </div>
      </div>
    </div>
  );
};

export default Events;
