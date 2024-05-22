'use client';
import { FaChevronRight, FaEraser } from 'react-icons/fa';
import { ElementRef, useEffect, useRef } from 'react';
import { HiStatusOnline } from 'react-icons/hi';
import { ScaleLoader } from 'react-spinners';
import { cn } from '@assets/lib/utils';

type TCommandWindow = {
  mapName: string;
  commands: { text: string; type: 'input' | 'response' | 'error' }[];
  isOnline: boolean;
  isLoading: boolean;
  onErase: (mapName: string) => void;
};
const CommandWindow = ({ commands, mapName, isLoading, isOnline, onErase }: TCommandWindow) => {
  const ref = useRef<ElementRef<'div'>>(null);

  useEffect(() => {
    ref.current?.scroll({
      top: ref.current.scrollHeight,
      behavior: 'smooth',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(commands)]);

  return (
    <div className="min-h-96 flex w-full flex-col">
      <div className="flex justify-between">
        <div className="rounded-tl-md rounded-tr-md border border-b-0 bg-stone-950 px-6 py-1 font-medium capitalize">
          {mapName}
        </div>
        <div className="flex items-center space-x-2 rounded-tl-md rounded-tr-md border border-b-0 bg-stone-950 px-6 py-1">
          <HiStatusOnline className="h-6 w-6 animate-pulse" />
          <span className={cn('font-medium', isOnline ? 'text-emerald-500' : 'text-destructive')}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
          <div
            className="rounded-md bg-muted px-2 py-1 hover:text-primary"
            role="button"
            aria-label="erase console"
            onClick={() => onErase(mapName)}
          >
            <FaEraser className="h-6 w-6 transition-colors" />
          </div>
        </div>
      </div>
      <div
        ref={ref}
        className="commandScroll relative h-96 max-h-96 overflow-auto rounded-md rounded-tl-none rounded-tr-none border bg-stone-950"
      >
        <pre className="flex flex-col p-4">
          {commands.length <= 0 && (
            <div className="flex space-x-2">
              <FaChevronRight className="h-8 w-8 animate-pulse" />
              <span className="mt-4">...</span>
            </div>
          )}
          {commands.map((command, idx) => {
            const isInput = command.type === 'input';
            const isError = command.type === 'error';

            return (
              <span
                className={cn(isInput && 'text-primary', isError && 'text-destructive')}
                key={`${mapName}-cmd-${idx}`}
              >
                {command.type === 'input' && '> '}
                {command.text}
              </span>
            );
          })}
        </pre>
        {isLoading && (
          <div className="sticky inset-0 flex h-full w-full items-center justify-center">
            <ScaleLoader color="#3b82f6" height={70} width={8} className="z-10" />
            <div className="absolute inset-0 h-full w-full bg-black/25 backdrop-blur-[2px]" />
          </div>
        )}
      </div>
    </div>
  );
};

export default CommandWindow;
