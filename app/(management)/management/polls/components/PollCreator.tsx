'use client';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@ui/form';
import { PollSchema, TPollSchema } from '@assets/lib/poll-validator';
import { zodResolver } from '@hookform/resolvers/zod';
import Combobox from '@assets/components/Combobox';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { errorToast } from '@assets/lib/utils';
import { useForm } from 'react-hook-form';
import { Textarea } from '@ui/textarea';
import { Button } from '@ui/button';
import { trpc } from '@trpc/index';
import { Input } from '@ui/input';
import { format } from 'date-fns';
import { Label } from '@ui/label';
import { useState } from 'react';
import { toast } from 'sonner';

type TPollCreator = {
  refetch: () => void;
};
const PollCreator = ({ refetch }: TPollCreator) => {
  const [isCreatorVisible, setIsCreatorVisible] = useState(false);

  const { data: channels, isLoading: channelsLoading } = trpc.management.getChannels.useQuery();
  const { data: roles, isLoading: rolesLoading } = trpc.management.getRoles.useQuery();
  const { mutate: createPoll, isLoading: isCreating } = trpc.management.createPoll.useMutation();

  const formatDate = (date: Date | undefined) => {
    // eslint-disable-next-line quotes
    return date ? format(date, "yyyy-MM-dd'T'HH:mm") : undefined;
  };

  const form = useForm<TPollSchema>({
    resolver: zodResolver(PollSchema),
    defaultValues: {
      title: '',
      description: '',
      channelId: '',
      expireAt: '',
      scheduleSend: '',
      options: [],
      ranks: [],
    },
  });

  const onRoleAdd = (roleName: string, roleId: string) => {
    const currentRoles = form.getValues().ranks;

    const isAlreadyAdded = currentRoles.find((role) => role.roleId === roleId);
    if (isAlreadyAdded) return errorToast('This role is already added');

    form.setValue('ranks', currentRoles.concat({ roleId, pointsPerVote: 1, roleName, maxVotes: 1 }));
  };

  const onSubmit = (values: TPollSchema) => {
    createPoll(values, {
      onSuccess: (data) => {
        if (data.success) {
          toast.success(data.message);
          refetch();
          form.reset();
          setIsCreatorVisible(false);
        } else {
          errorToast(data.message);
        }
      },
      onError: () => errorToast(),
    });
  };

  if (!isCreatorVisible) {
    return (
      <Button onClick={() => setIsCreatorVisible(true)} className="max-w-md">
        Click to add
      </Button>
    );
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="max-w-md space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poll Title*</FormLabel>
                  <FormControl>
                    <Input placeholder="New Ideas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poll Description*</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Vote for changes to our network" {...field} rows={5} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="channelId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Poll Channel*</FormLabel>
                  <FormControl>
                    <Combobox
                      data={channels || []}
                      notFoundText="No channels found."
                      searchLabel="Type to search..."
                      className="w-full max-w-xs"
                      isLoading={channelsLoading}
                      selectText="Click to expand"
                      onSelect={(_, value) => field.onChange(value)}
                      isDisabled={field.disabled}
                    />
                  </FormControl>
                  <FormDescription>The poll will be sent here</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expireAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Auto close at</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      className="w-full"
                      value={typeof field.value === 'object' ? formatDate(field.value) : undefined}
                      onChange={(event) => field.onChange(new Date(event.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="scheduleSend"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Schedule Send</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      className="w-full"
                      value={typeof field.value === 'object' ? formatDate(field.value) : undefined}
                      onChange={(event) => field.onChange(new Date(event.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ranks"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Roles preferences</FormLabel>
                  <FormControl>
                    <>
                      <div className="space-y-2">
                        {field.value.map((role) => (
                          <div
                            key={`${role.roleId}-current`}
                            className="mt-1 flex flex-col space-y-1 rounded-md border p-1"
                          >
                            <Label className="mb-2 text-center">{role.roleName} preferences</Label>
                            <div className="flex space-x-2">
                              <div className="flex flex-col">
                                <Label className="mb-1">Vote multiplier</Label>
                                <Input
                                  type="number"
                                  value={role.pointsPerVote}
                                  onChange={(event) => {
                                    const newValue = event.target.value;

                                    field.onChange(
                                      field.value.map((rank) => {
                                        if (rank.roleId === role.roleId) {
                                          return { ...rank, pointsPerVote: parseInt(newValue) };
                                        } else {
                                          return rank;
                                        }
                                      }),
                                    );
                                  }}
                                />
                              </div>
                              <div className="flex flex-col">
                                <Label className="mb-1">Max votes</Label>
                                <Input
                                  type="number"
                                  value={role.maxVotes}
                                  onChange={(event) => {
                                    const newValue = event.target.value;

                                    field.onChange(
                                      field.value.map((rank) => {
                                        if (rank.roleId === role.roleId) {
                                          return { ...rank, maxVotes: parseInt(newValue) };
                                        } else {
                                          return rank;
                                        }
                                      }),
                                    );
                                  }}
                                />
                              </div>
                              <Button
                                size="icon"
                                type="button"
                                variant="destructive"
                                onClick={() => {
                                  field.onChange(
                                    field.value.filter((rank) => {
                                      return rank.roleId !== role.roleId;
                                    }),
                                  );
                                }}
                              >
                                <FaTrash />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Combobox
                        data={roles || []}
                        notFoundText="No roles found."
                        searchLabel="Type to search..."
                        className="w-full max-w-xs"
                        isLoading={rolesLoading}
                        selectText="Click to expand"
                        cancelSelect
                        onSelect={onRoleAdd}
                        isDisabled={field.disabled}
                      />
                    </>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="options"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Voting Options</FormLabel>
                  <FormControl>
                    <>
                      <div className="space-y-2">
                        {field.value.map((option, idx) => (
                          <div key={`${idx}-option`} className="flex flex-col space-y-1">
                            <div className="flex space-x-2">
                              <Textarea
                                value={option.description}
                                onChange={(event) => {
                                  const newValue = event.target.value;

                                  field.onChange(
                                    field.value.map((entry, fieldIdx) => {
                                      if (idx === fieldIdx) {
                                        return { ...entry, description: newValue };
                                      } else {
                                        return entry;
                                      }
                                    }),
                                  );
                                }}
                              />
                              <Button
                                size="icon"
                                type="button"
                                variant="destructive"
                                onClick={() => {
                                  field.onChange(
                                    field.value.filter((entry) => {
                                      console.log(entry);
                                      return entry.id !== option.id;
                                    }),
                                  );
                                }}
                              >
                                <FaTrash />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        type="button"
                        className="flex max-w-xs items-center gap-2"
                        onClick={() => {
                          const newId = Math.max(...field.value.map((entry) => entry.id), 0) + 1;
                          field.onChange(field.value.concat({ id: newId, description: '' }));
                        }}
                      >
                        <span>Add new</span>
                        <FaPlus />
                      </Button>
                    </>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" className="w-full max-w-md" disabled={isCreating}>
            {form.getValues().scheduleSend ? 'Schedule Send' : 'Send Poll'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default PollCreator;
