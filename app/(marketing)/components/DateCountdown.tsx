'use client';
import Countdown, { CountdownRenderProps } from 'react-countdown';
import { cn, relativeDate } from '@assets/lib/utils';
import React, { useEffect, useState } from 'react';

const renderer = ({
  days,
  hours,
  minutes,
  seconds,
  completed,
  originalDate,
}: CountdownRenderProps & { originalDate: Date }) => {
  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center">
        <span className="text-4xl font-semibold">
          The servers were wiped <span className="lowercase text-primary">{relativeDate(originalDate)}</span>
        </span>
        <span className="text-lg">The next countdown will start tomorrow</span>
      </div>
    );
  }

  return (
    <div className="flex justify-center space-x-8">
      <div className="flex flex-col items-center">
        <span className="text-4xl font-semibold">{days}</span>
        <span>day{days !== 1 && 's'}</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-4xl font-semibold">{hours}</span>
        <span>hour{hours !== 1 && 's'}</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-4xl font-semibold">{minutes}</span>
        <span>minute{minutes !== 1 && 's'}</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-4xl font-semibold">{seconds}</span>
        <span>second{seconds !== 1 && 's'}</span>
      </div>
    </div>
  );
};

type TDateCountdown = {
  toDate: Date;
  className?: string;
};
const DateCountdown = ({ toDate, className }: TDateCountdown) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return null;

  return (
    <div className={cn(className)}>
      <Countdown date={toDate} renderer={(props) => renderer({ ...props, originalDate: toDate })} />
    </div>
  );
};

export default DateCountdown;
