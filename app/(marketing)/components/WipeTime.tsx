import { WavyBackground } from '@ui/wavy-background';
import DateCountdown from './DateCountdown';
import ScrollInfo from './ScrollInfo';
import { format } from 'date-fns';
import React from 'react';

type TWipeTime = {
  nextWipe: Date;
  lastWipe: Date;
  wipeDelayInDays: number;
};
const WipeTime = ({ lastWipe, nextWipe, wipeDelayInDays }: TWipeTime) => {
  return (
    <div className="relative">
      <WavyBackground
        className=""
        backgroundFill="#020817"
        canvasOpacity={0.5}
        colors={['#3B82F6', '#523BF6', '#3BDFF6']}
      >
        <p className="text-center text-2xl font-bold text-white md:text-4xl lg:text-7xl">The Next Servers Wipe</p>
        <DateCountdown toDate={nextWipe} className="mt-4" />
        <p className="mt-1 text-center text-muted-foreground">Servers wipe every {wipeDelayInDays} days</p>
        <p className="text-center text-muted-foreground">The last wipe was on {format(lastWipe, 'dd-MM-yyyy')}</p>
        <div className="absolute right-1/2 mt-12 translate-x-1/2 md:-right-[20%] md:mt-0 md:translate-x-0">
          <ScrollInfo />
        </div>
      </WavyBackground>
    </div>
  );
};

export default WipeTime;
