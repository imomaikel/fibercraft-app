'use client';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/popover';
import { useEffect, useMemo, useState } from 'react';
import { PiCaretUpDownBold } from 'react-icons/pi';
import { CgSpinnerTwo } from 'react-icons/cg';
import { FaCheck } from 'react-icons/fa';
import { cn } from '@assets/lib/utils';
import { Button } from '@ui/button';

type TCombobox = {
  data: {
    label: string;
    value: string;
  }[];
  onSelect?: (label: string, value: string) => void;
  onReset?: () => void;
  defaultValue?: string;
  selectText: string;
  searchLabel: string;
  notFoundText: string;
  className?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
};

const Combobox = ({
  data: _data,
  onSelect,
  onReset,
  defaultValue,
  notFoundText,
  selectText,
  className,
  searchLabel,
  isLoading,
  isDisabled,
}: TCombobox) => {
  const data = useMemo(
    () => _data.map((entry) => ({ label: entry.label, value: `${entry.label}:${entry.value}` })),
    [_data],
  );
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState({
    label: '',
    value: '',
  });

  useEffect(() => {
    if (!defaultValue) return;
    const defaultLabel = data.find((entry) => entry.value.endsWith(defaultValue))?.label;
    if (!defaultLabel) return;
    setSelected({
      label: defaultLabel,
      value: `${defaultLabel.toLocaleLowerCase()}:${defaultValue}`,
    });
  }, [data, defaultValue]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={isDisabled}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('relative w-[200px] justify-between', className)}
        >
          {isLoading && (
            <div className="absolute inset-0 flex h-full w-full items-center rounded-sm bg-background">
              <CgSpinnerTwo className="ml-4 h-6 w-6 animate-spin" />
              <span className="ml-1 text-muted-foreground">Loading</span>
            </div>
          )}
          <div className="truncate">
            {selected.value ? data.find((entry) => entry.value.toLowerCase() === selected.value)?.label : selectText}
          </div>
          <PiCaretUpDownBold className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      {!isLoading && !isDisabled && (
        <PopoverContent className={cn('p-0', className)}>
          <Command>
            <CommandInput placeholder={searchLabel} />
            <CommandEmpty>{notFoundText}</CommandEmpty>
            <CommandGroup className="max-h-[40vh] overflow-y-auto">
              {data.map((entry, index) => (
                <CommandItem
                  key={entry.value + index}
                  value={entry.value}
                  onSelect={(currentValue) => {
                    setOpen(false);
                    const newValue = currentValue === selected.value ? '' : currentValue;
                    const newLabel = data.find((item) => item.value.toLowerCase() === newValue)?.label;

                    if (newValue.length === 0 && onReset) onReset();

                    if (!newLabel) {
                      if (onReset) {
                        setSelected({
                          label: '',
                          value: '',
                        });
                      }
                      return;
                    }

                    if (newValue.length >= 1 && onSelect) onSelect(newLabel, newValue.split(':')[1]);

                    setSelected({
                      value: newValue,
                      label: newLabel,
                    });
                  }}
                >
                  {entry.label}
                  <FaCheck
                    className={cn(
                      'w-4" ml-auto h-4',
                      selected.value === entry.value.toLowerCase() ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      )}
    </Popover>
  );
};

export default Combobox;
