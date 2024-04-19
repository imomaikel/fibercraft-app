'use client';
import { HiClipboardCopy } from 'react-icons/hi';
import { Button } from '@ui/button';
import { Input } from '@ui/input';
import { toast } from 'sonner';

type TDataEntry = {
  title: string;
  value: string | number;
};
const DataEntry = ({ value, title }: TDataEntry) => {
  const handleCopy = () => {
    window.navigator.clipboard
      .writeText(value.toString())
      .then(() => toast.info(`Copied "${value}"`))
      .catch(() => toast.error('Failed to copy!'));
  };

  return (
    <div className="flex flex-col space-y-0.5">
      <p className="font-semibold tracking-wide">{title}</p>
      <div className="flex">
        <Input disabled defaultValue={value} className="max-w-[200px] rounded-br-none rounded-tr-none border-r-0" />
        <Button size="icon" className="rounded-bl-none rounded-tl-none" onClick={handleCopy}>
          <HiClipboardCopy className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default DataEntry;
