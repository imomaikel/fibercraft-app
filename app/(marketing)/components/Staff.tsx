'use client';
import MarketingSectionWrapper from './MarketingSectionWrapper';
import { AnimatedTooltip } from '@ui/animated-tooltip';
import { trpc } from '@trpc/index';

const Staff = () => {
  const { data: staff, isLoading } = trpc.publicRouter.getStaff.useQuery(undefined, {
    refetchOnWindowFocus: false,
    retry: 1,
  });

  if (isLoading || !staff || !staff.length) return null;

  return (
    <MarketingSectionWrapper theme="DARK" description="See who makes it all happen" title="Meet our team">
      <div className="mx-auto w-fit pr-4">
        <AnimatedTooltip items={staff} />
      </div>
      <div className="mt-2 text-center text-sm text-muted-foreground">
        We have <span>{staff.length}</span> staff members to provide you the best experience.
      </div>
    </MarketingSectionWrapper>
  );
};

export default Staff;
