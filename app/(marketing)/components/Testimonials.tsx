'use client';
import { InfiniteMovingCards } from '@ui/infinite-moving-cards';
import MarketingSectionWrapper from './MarketingSectionWrapper';
import { IoMdSpeedometer } from 'react-icons/io';
import { useState } from 'react';

const Testimonials = () => {
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('slow');

  const onSpeedChange = () => {
    if (speed === 'slow') return setSpeed('normal');
    if (speed === 'normal') return setSpeed('fast');
    setSpeed('slow');
  };

  return (
    <MarketingSectionWrapper
      theme="DARK"
      description="Discover the acclaim we've garnered"
      title="Testimonials"
      className="!mb-96"
    >
      <div className="absolute left-1/2 right-1/2 h-full w-screen -translate-x-1/2">
        <div className="relative flex h-fit w-full flex-col items-center justify-center overflow-hidden bg-background antialiased">
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

const testimonials = [
  {
    quote:
      'It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair.',
    name: 'Charles Dickens',
    title: 'A Tale of Two Cities',
  },
  {
    quote:
      'To be, or not to be, that is the question: Whether tis nobler in the mind to suffer The slings and arrows of outrageous fortune, Or to take Arms against a Sea of troubles, And by opposing end them: to die, to sleep.',
    name: 'William Shakespeare',
    title: 'Hamlet',
  },
  {
    quote: 'All that we see or seem is but a dream within a dream.',
    name: 'Edgar Allan Poe',
    title: 'A Dream Within a Dream',
  },
  {
    quote:
      'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.',
    name: 'Jane Austen',
    title: 'Pride and Prejudice',
  },
  {
    quote:
      'Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.',
    name: 'Herman Melville',
    title: 'Moby-Dick',
  },
];
