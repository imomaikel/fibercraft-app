'use client';
import { cn } from '@assets/lib/utils';

type TMarketingSectionWrapper = {
  theme: 'GRAY' | 'DARK';
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
};
const MarketingSectionWrapper = ({ children, theme, description, title, className }: TMarketingSectionWrapper) => {
  return (
    <div className="relative">
      <div
        className={cn(
          'absolute left-1/2 right-1/2 -z-10  h-full w-screen -translate-x-1/2',
          theme === 'GRAY' ? 'bg-muted/50' : 'bg-background',
        )}
      />
      <div className="space-y-4 py-32">
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold md:text-6xl">{title}</h1>
          <p className="text-muted-foreground md:text-lg">{description}</p>
        </div>
        <div className={cn(className)}>{children}</div>
      </div>
    </div>
  );
};

export default MarketingSectionWrapper;
