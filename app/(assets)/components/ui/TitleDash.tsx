import { cn } from '@assets/lib/utils';

type TTitleDash = {
  title: React.ReactNode;
  value?: React.ReactNode;
  className?: string;
};
export const TitleDash = ({ title, className, value }: TTitleDash) => {
  return (
    <div className="relative flex w-full items-center">
      {title}
      <div className={cn('mx-4 flex h-px flex-1 bg-muted', className)} />
      {value}
    </div>
  );
};
