'use client';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { CalendarIcon } from '@radix-ui/react-icons';
import { cn } from '@assets/lib/utils';
import { Calendar } from './calendar';
import { format } from 'date-fns';
import { Button } from './button';
import * as React from 'react';

type TDatePicker = {
  date: Date | null;
  onChange: (newDate: Date) => void;
  className?: string;
  disabled?: boolean;
};
const DatePicker = ({ date, className, disabled, onChange }: TDatePicker) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn('justify-start text-left font-normal', !date && 'text-muted-foreground', className)}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'PPP') : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date || undefined}
          onSelect={(newDate) => newDate && onChange(newDate)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
