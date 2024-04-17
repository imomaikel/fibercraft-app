'use client';
import { motion, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { cn } from '@assets/lib/utils';
import { useState } from 'react';
import Image from 'next/image';

export const AnimatedTooltip = ({
  items,
}: {
  items: {
    id: number;
    name: string;
    designation: string;
    image: string;
    daysInTeam?: number;
  }[];
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [currentItem, setCurrentItem] = useState({
    days: 0,
    name: '',
  });
  const springConfig = { stiffness: 100, damping: 5 };
  // going to set this value on mouse move
  const x = useMotionValue(0);
  // rotate the tooltip
  const rotate = useSpring(useTransform(x, [-100, 100], [-45, 45]), springConfig);
  // translate the tooltip
  const translateX = useSpring(useTransform(x, [-100, 100], [-50, 50]), springConfig);
  const handleMouseMove = (event: any) => {
    const halfWidth = event.target.offsetWidth / 2;
    // set the x value, which is then used in transform and rotate
    x.set(event.nativeEvent.offsetX - halfWidth);
  };

  return (
    <div className="flex flex-col">
      <div className={cn('text-center text-sm font-semibold', hoveredIndex && 'invisible')}>
        Hover on a profile picture to see details
      </div>
      <div className="mt-12 flex flex-wrap items-center justify-center">
        {items.map((item) => (
          <div
            className="group relative -mr-4"
            key={item.name}
            onMouseEnter={() => {
              setHoveredIndex(item.id);
              setCurrentItem({
                days: item.daysInTeam || 0,
                name: item.name,
              });
            }}
            onMouseLeave={() => {
              setHoveredIndex(null);
              setCurrentItem({
                days: 0,
                name: '',
              });
            }}
          >
            {hoveredIndex === item.id && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.6 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: 'spring',
                    stiffness: 260,
                    damping: 10,
                  },
                }}
                exit={{ opacity: 0, y: 20, scale: 0.6 }}
                // bg-gradient-to-r from-green-300 via-blue-500 to-purple-600
                style={{
                  translateX: translateX,
                  rotate: rotate,
                  whiteSpace: 'nowrap',
                }}
                className="absolute -left-1/2 -top-16 z-50 flex translate-x-1/2 flex-col items-center justify-center rounded-md bg-black px-4 py-2 text-xs shadow-xl"
              >
                <div className="absolute inset-x-10 -bottom-px z-30 h-px w-[20%] bg-gradient-to-r from-transparent via-primary to-transparent" />
                <div className="absolute -bottom-px left-10 z-30 h-px w-[40%] bg-gradient-to-r from-transparent via-purple-600 to-transparent " />
                <div className="relative z-30 text-base font-bold text-white">{item.name}</div>
                <div className="text-xs text-white">{item.designation}</div>
              </motion.div>
            )}
            <Image
              onMouseMove={handleMouseMove}
              height={100}
              width={100}
              src={item.image}
              alt={item.name}
              className="relative !m-0 h-14 w-14 rounded-full border-2 border-white bg-background object-cover object-top !p-0  transition duration-500 group-hover:z-30 group-hover:scale-105"
            />
          </div>
        ))}
      </div>
      <p className={cn('invisible translate-y-1.5 text-center', currentItem.days > 1 && 'visible')}>
        <span className="font-semibold text-primary">{currentItem.name}</span> joined the staff {currentItem.days} days
        ago
      </p>
    </div>
  );
};

// https://ui.aceternity.com/components/animated-tooltip
