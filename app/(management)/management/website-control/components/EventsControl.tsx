'use client';
import ItemWrapper from '../../components/ItemWrapper';
import { errorToast } from '@assets/lib/utils';
import { FaTrashAlt } from 'react-icons/fa';
import DatePicker from '@ui/date-picker';
import React, { useState } from 'react';
import { Textarea } from '@ui/textarea';
import { Button } from '@ui/button';
import { trpc } from '@trpc/index';
import { Label } from '@ui/label';
import { toast } from 'sonner';

const EventsControl = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [text, setText] = useState('');

  const { data: events, isLoading, refetch } = trpc.publicRouter.getEvents.useQuery();
  const { mutate: addEvent, isLoading: isAdding } = trpc.management.addEvent.useMutation();
  const { mutate: removeEvent, isLoading: isRemoving } = trpc.management.removeEvent.useMutation();

  const handleAdd = () => {
    addEvent(
      { expireAt: date, text },
      {
        onSuccess: ({ error, message }) => {
          if (error) return errorToast(message);
          toast.success('Event added!');
          refetch();
        },
        onError: () => errorToast(),
      },
    );
  };

  const handleRemove = (id: number) => {
    removeEvent(
      { id },
      {
        onSuccess: ({ error }) => {
          if (error) return errorToast();
          toast.success('Event removed!');
          refetch();
        },
        onError: () => errorToast(),
      },
    );
  };

  if (isLoading) return null;

  return (
    <ItemWrapper title="Events" description="Configure the events displayed on the store page">
      <div className="space-y-4">
        <div className="max-w-md">
          <p className="mb-1 font-bold">New Event</p>
          <div className="space-y-2">
            <div className="flex flex-col space-y-0.5">
              <Label className="font-medium">Content</Label>
              <Textarea rows={4} value={text} onChange={(event) => setText(event.target.value)} disabled={isAdding} />
            </div>
            <div className="flex flex-col space-y-0.5">
              <Label className="font-medium">Expire At</Label>
              <DatePicker date={date} onChange={setDate} className="w-full" disabled={isAdding} />
            </div>

            <Button className="w-full" disabled={isAdding} onClick={handleAdd}>
              Add
            </Button>
          </div>
        </div>
        <div>
          <p className="mb-1 font-bold">Enabled Events</p>
          <div className="space-y-3">
            {events?.map((event, idx) => (
              <div key={`evt-${idx}`} className="flex max-w-md items-center space-x-2">
                <Textarea disabled value={event.text} rows={4} />
                <Button size="icon" variant="destructive" onClick={() => handleRemove(event.id)} disabled={isRemoving}>
                  <FaTrashAlt className="h-6 w-6" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ItemWrapper>
  );
};

export default EventsControl;
