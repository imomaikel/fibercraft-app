'use client';
import { HiClipboardCopy } from 'react-icons/hi';
import { Textarea } from '@ui/textarea';
import { Button } from '@ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

type TCommandEntry = {
  value: string;
};
const CommandEntry = ({ value }: TCommandEntry) => {
  const [textValue, setTextValue] = useState(value);

  const handleCopy = () => {
    window.navigator.clipboard
      .writeText(textValue)
      .then(() => toast.info('Copied!'))
      .catch(() => toast.error('Failed to copy!'));
  };

  return (
    <div className="flex flex-col space-y-0.5">
      <div className="mt-2 flex w-2/5 flex-col">
        <Textarea
          value={textValue}
          className="resize-none rounded-bl-none rounded-br-none"
          rows={4}
          onChange={(event) => setTextValue(event.target.value)}
        />
        <Button size="icon" className="w-full rounded-tl-none rounded-tr-none" onClick={handleCopy}>
          <HiClipboardCopy className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default CommandEntry;
