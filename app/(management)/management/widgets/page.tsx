'use client';
import ManagementPageWrapper from '../components/ManagementPageWrapper';
import { errorToast, widgetEnums } from '@assets/lib/utils';
import ItemWrapper from '../components/ItemWrapper';
import Combobox from '@assets/components/Combobox';
import { trpc } from '@trpc/index';
import { Label } from '@ui/label';
import { toast } from 'sonner';
import { z } from 'zod';

const ManagementWidgetsPage = () => {
  const { mutate: updateWidget, isLoading: isUpdating } = trpc.management.updateWidget.useMutation();
  const { data: channels, isLoading: channelsLoading } = trpc.management.getChannels.useQuery();
  const { data: widgetData, isLoading: widgetsLoading } = trpc.management.getWidgets.useQuery();
  const { data: roles, isLoading: rolesLoading } = trpc.management.getRoles.useQuery();

  const handleUpdate = (value: string | null, widget: z.infer<typeof widgetEnums>) => {
    updateWidget(
      {
        field: widget,
        newValue: value,
      },
      {
        onSuccess: (data) => {
          if (data.success) {
            if (data.label) {
              toast.success(`Updated to: "${data.label}"`);
            } else {
              toast.success('Reset done!');
            }
          } else if (data.error) {
            errorToast(data.message);
          }
        },
        onError: (error) => errorToast(error.data),
      },
    );
  };

  return (
    <ManagementPageWrapper pageLabel="Widgets">
      <div className="space-y-4">
        <ItemWrapper title="Testimonials" description="Configure the testimonial widget.">
          <div className="mt-2 space-y-3">
            <div className="flex flex-col space-y-1">
              <Label>Testimonials Channel</Label>
              <Combobox
                data={channels || []}
                notFoundText="No channels found."
                searchLabel="Type to search..."
                className="w-full max-w-xs"
                isLoading={channelsLoading || widgetsLoading}
                selectText="Click to expand"
                defaultValue={widgetData?.testimonialsChannelId || undefined}
                isDisabled={isUpdating}
                onSelect={(_, value) => handleUpdate(value, 'testimonialsChannelId')}
                onReset={() => handleUpdate(null, 'testimonialsChannelId')}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <Label>Role that can accept or deny testimonials</Label>
              <Combobox
                data={roles || []}
                notFoundText="No roles found."
                searchLabel="Type to search..."
                className="w-full max-w-xs"
                isLoading={rolesLoading || widgetsLoading}
                selectText="Click to expand"
                defaultValue={widgetData?.testimonialsRoleId || undefined}
                isDisabled={isUpdating}
                onSelect={(_, value) => handleUpdate(value, 'testimonialsRoleId')}
                onReset={() => handleUpdate(null, 'testimonialsRoleId')}
              />
            </div>
          </div>
        </ItemWrapper>
        <ItemWrapper
          title="Link & Kick Widget"
          description="A widget where players can link Discord with ARK and kick themselves from maps"
        >
          <div className="flex flex-col space-y-1">
            <Label>Widget Channel</Label>
            <Combobox
              data={channels || []}
              notFoundText="No channels found."
              searchLabel="Type to search..."
              className="w-full max-w-xs"
              isLoading={channelsLoading || widgetsLoading}
              selectText="Click to expand"
              defaultValue={widgetData?.discordLinkChannelId || undefined}
              isDisabled={isUpdating}
              onSelect={(_, value) => handleUpdate(value, 'discordLinkChannelId')}
              onReset={() => handleUpdate(null, 'discordLinkChannelId')}
            />
          </div>
        </ItemWrapper>
        <ItemWrapper title="RCON Commands Channel" description="Decide where RCON command logs should be sent">
          <div className="flex flex-col space-y-1">
            <Label>Log Channel</Label>
            <Combobox
              data={channels || []}
              notFoundText="No channels found."
              searchLabel="Type to search..."
              className="w-full max-w-xs"
              isLoading={channelsLoading || widgetsLoading}
              selectText="Click to expand"
              defaultValue={widgetData?.rconLogsChannelId || undefined}
              isDisabled={isUpdating}
              onSelect={(_, value) => handleUpdate(value, 'rconLogsChannelId')}
              onReset={() => handleUpdate(null, 'rconLogsChannelId')}
            />
          </div>
        </ItemWrapper>
      </div>
    </ManagementPageWrapper>
  );
};

export default ManagementWidgetsPage;
