import MarketingSectionWrapper from './MarketingSectionWrapper';
import { AnimatedTooltip } from '@ui/animated-tooltip';

const Staff = () => {
  return (
    <MarketingSectionWrapper theme="GRAY" description="See who makes it all happen" title="Meet our team">
      <div className="mx-auto w-fit pr-4">
        <AnimatedTooltip items={TEMP_STAFF.items} />
      </div>
      <div className="mt-2 text-center text-sm text-muted-foreground">
        We have <span>{TEMP_STAFF.items.length}</span> staff members to provide you the best experience.
      </div>
    </MarketingSectionWrapper>
  );
};

export default Staff;

const TEMP_STAFF: React.ComponentProps<typeof AnimatedTooltip> = {
  items: [
    {
      id: 1,
      designation: 'Admin',
      image: '/logo.webp',
      name: 'John',
      daysInTeam: 20,
    },
    {
      id: 2,
      designation: 'Support',
      image: '/logo.webp',
      name: 'Mike',
      daysInTeam: 200,
    },
    {
      id: 3,
      designation: 'Developer',
      image: '/logo.webp',
      name: 'Emily',
      daysInTeam: 150,
    },
    {
      id: 4,
      designation: 'Manager',
      image: '/logo.webp',
      name: 'Sarah',
      daysInTeam: 350,
    },
    {
      id: 5,
      designation: 'Designer',
      image: '/logo.webp',
      name: 'Chris',
      daysInTeam: 100,
    },
    {
      id: 6,
      designation: 'Marketing',
      image: '/logo.webp',
      name: 'Alex',
      daysInTeam: 280,
    },
    {
      id: 7,
      designation: 'Sales',
      image: '/logo.webp',
      name: 'Sophia',
      daysInTeam: 75,
    },
    {
      id: 8,
      designation: 'HR',
      image: '/logo.webp',
      name: 'Daniel',
      daysInTeam: 420,
    },
    {
      id: 9,
      designation: 'Finance',
      image: '/logo.webp',
      name: 'Rachel',
      daysInTeam: 230,
    },
    {
      id: 10,
      designation: 'Operations',
      image: '/logo.webp',
      name: 'Matt',
      daysInTeam: 180,
    },
    {
      id: 11,
      designation: 'Research',
      image: '/logo.webp',
      name: 'Lily',
      daysInTeam: 300,
    },
    {
      id: 12,
      designation: 'Customer Success',
      image: '/logo.webp',
      name: 'Tom',
      daysInTeam: 90,
    },
  ],
};
