'use client';
import ManagementPageWrapper from '../components/ManagementPageWrapper';
import { useCurrentUser } from '@assets/hooks/useCurrentUser';
import ItemWrapper from '../components/ItemWrapper';
import Combobox from '@assets/components/Combobox';
import { trpc } from '@trpc/index';
import { toast } from 'sonner';

const ManagementDiscordSelectionPage = () => {
  const { user, updateSession } = useCurrentUser();

  const { data: guilds, isLoading } = trpc.management.getGuilds.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const { mutate: selectGuild, isLoading: isUpdating } = trpc.management.selectGuild.useMutation();

  const selectedGuild = user?.selectedDiscordId;

  const handleSelect = (label: string, value: string) => {
    console.log(label, value);
    selectGuild(
      { guildId: value },
      {
        onError: () => toast.error('Something went wrong!'),
        onSuccess: ({ error, message, success }) => {
          if (error) return toast.error(message);
          if (success) {
            toast.info(`Selected "${label}"`);

            updateSession();
          }
        },
      },
    );
  };

  return (
    <ManagementPageWrapper pageLabel="Discord Selection">
      <ItemWrapper title="Server selection" description="Select the server where all of the widgets will be sent.">
        <Combobox
          data={guilds || []}
          notFoundText="No servers found."
          searchLabel="Type to search"
          selectText="Click to open"
          className="w-full max-w-xs"
          defaultValue={selectedGuild}
          isLoading={isLoading || isUpdating}
          onSelect={handleSelect}
        />
      </ItemWrapper>
    </ManagementPageWrapper>
  );
};

export default ManagementDiscordSelectionPage;
