'use client';
import { InfiniteMovingCards } from '@ui/infinite-moving-cards';
import MarketingSectionWrapper from './MarketingSectionWrapper';
import { IoMdSpeedometer } from 'react-icons/io';
import { trpc } from '@trpc/index';
import { useState } from 'react';

const Testimonials = () => {
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('slow');

  const { data: testimonials, isLoading } = trpc.publicRouter.getTestimonials.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const onSpeedChange = () => {
    if (speed === 'slow') return setSpeed('normal');
    if (speed === 'normal') return setSpeed('fast');
    setSpeed('slow');
  };

  // TODO Skeleton
  if (isLoading) return null;
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <MarketingSectionWrapper
      theme="DARK"
      description="Discover the acclaim we've garnered"
      title="Testimonials"
      className="!mb-96"
    >
      <div className="absolute left-1/2 right-1/2 w-screen -translate-x-1/2">
        <div className="relative flex h-fit w-full flex-col items-center justify-center bg-background antialiased">
          <InfiniteMovingCards items={testimonials} direction="right" speed={speed} />
        </div>
        <div className="mx-auto flex max-w-screen-2xl justify-center">
          <div
            className="flex items-center space-x-2 rounded-md px-4 py-2 transition-colors hover:bg-muted/50"
            aria-label="change speed"
            onClick={onSpeedChange}
            role="button"
          >
            <IoMdSpeedometer className="h-8 w-8" />
            <div className="flex flex-col items-center justify-center">
              <p className="text-sm text-muted-foreground">Click to change speed</p>
              <p className="text-xs text-muted-foreground">Now: {speed}</p>
            </div>
          </div>
        </div>
      </div>
    </MarketingSectionWrapper>
  );
};

export default Testimonials;
