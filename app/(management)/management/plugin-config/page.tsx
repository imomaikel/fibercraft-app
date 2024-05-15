'use client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@ui/dialog';
import ManagementPageWrapper from '../components/ManagementPageWrapper';
import { managementRouter } from '@trpc/management-router';
import ItemWrapper from '../components/ItemWrapper';
import { inferRouterOutputs } from '@trpc/server';
import { errorToast } from '@assets/lib/utils';
import { Checkbox } from '@ui/checkbox';
import { Button } from '@ui/button';
import { trpc } from '@trpc/index';
import { Badge } from '@ui/badge';
import { useState } from 'react';
import { toast } from 'sonner';

type TResponseServers = Exclude<
  inferRouterOutputs<typeof managementRouter>['changeStructuresConfig'],
  undefined
>['servers'];

const ManagementPluginConfigPage = () => {
  const [checked, setChecked] = useState<number[]>([]);
  const [response, setResponse] = useState<{
    servers: TResponseServers;
    isOpen: boolean;
  }>({
    servers: [],
    isOpen: false,
  });

  const { data, isLoading, refetch, isRefetching } = trpc.management.getStructuresConfig.useQuery(undefined, {
    onSuccess: (serverResponse) => {
      if (serverResponse.servers && checked.length <= 0) {
        setChecked(serverResponse.servers.map((entry) => entry.id));
      }
    },
  });

  const { mutate: changeStructuresConfig, isLoading: isUpdating } =
    trpc.management.changeStructuresConfig.useMutation();

  const onUpdate = (method: 'ADD' | 'REMOVE') => {
    changeStructuresConfig(
      {
        method,
        serverIds: checked,
      },
      {
        onSuccess: (serverResponse) => {
          if (serverResponse) {
            refetch();
            setResponse({ isOpen: true, servers: serverResponse.servers });
          } else {
            errorToast();
          }
        },
        onError: () => errorToast(),
      },
    );
  };

  const onCheck = (serverId: number) => {
    if (checked.includes(serverId)) {
      setChecked(checked.filter((id) => id !== serverId));
    } else {
      setChecked([...checked, serverId]);
    }
  };

  const handleRefetch = () => {
    refetch().then(() => {
      toast.info('Refreshed!');
    });
  };

  if (isLoading) return;

  return (
    <>
      <ManagementPageWrapper pageLabel="Plugin Config">
        <ItemWrapper title="AntiStructureMesh Plugin" description="Control the anti mesh system for Tek Teleporters">
          <div className="max-w-md space-y-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Selected</TableHead>
                  <TableHead>Map</TableHead>
                  <TableHead>Tek Teleporter</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.servers.map((server) => {
                  return (
                    <TableRow key={`server-${server.id}`}>
                      <TableCell className="py-1">
                        <Checkbox onCheckedChange={() => onCheck(server.id)} checked={checked.includes(server.id)} />
                      </TableCell>
                      <TableCell>{server.name}</TableCell>
                      <TableCell>
                        <Badge>{server.fileStatus}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-x-2">
                <Button variant="positive" onClick={() => onUpdate('ADD')} disabled={isUpdating}>
                  Add Teleporter
                </Button>
                <Button variant="destructive" onClick={() => onUpdate('REMOVE')} disabled={isUpdating}>
                  Remove Teleporter
                </Button>
              </div>
              <Button className="w-full" onClick={handleRefetch} disabled={isRefetching || isUpdating}>
                Refresh
              </Button>
            </div>
          </div>
        </ItemWrapper>
      </ManagementPageWrapper>
      <Dialog open={response.isOpen} onOpenChange={() => setResponse({ isOpen: false, servers: [] })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Action Results</DialogTitle>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Map</TableHead>
                <TableHead>File Changed</TableHead>
                <TableHead>Plugin Reloaded</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {response.servers.map((server) => {
                return (
                  <TableRow key={`server-result-${server.id}`}>
                    <TableCell>{server.name}</TableCell>
                    <TableCell>
                      <Badge>{server.fileStatus}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge>{server.rconStatus ? 'Succeed' : 'Failed'}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ManagementPluginConfigPage;
