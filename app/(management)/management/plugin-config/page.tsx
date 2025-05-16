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
  inferRouterOutputs<typeof managementRouter>['changePluginConfig'],
  undefined
>['servers'];

const ManagementPluginConfigPage = () => {
  const [checkedStructures, setCheckedStructures] = useState<number[]>([]);
  const [checkedCryorama, setCheckedCryorama] = useState<number[]>([]);
  const [response, setResponse] = useState<{
    servers: TResponseServers;
    isOpen: boolean;
  }>({
    servers: [],
    isOpen: false,
  });

  const { data, isLoading, refetch, isRefetching } = trpc.management.getPluginsConfig.useQuery(undefined, {
    onSuccess: (serverResponse) => {
      if (serverResponse.structureStatuses && checkedStructures.length <= 0) {
        setCheckedStructures(serverResponse.structureStatuses.servers.map((entry) => entry.id));
      }
      if (serverResponse.cryoramaStatuses && checkedCryorama.length <= 0) {
        setCheckedCryorama(serverResponse.cryoramaStatuses.servers.map((entry) => entry.id));
      }
    },
  });

  const { mutate: changePluginConfig, isLoading: isUpdating } = trpc.management.changePluginConfig.useMutation();

  const onUpdate = (method: 'ADD' | 'REMOVE', plugin: 'STRUCTURES' | 'CRYORAMA') => {
    changePluginConfig(
      {
        method,
        serverIds: plugin === 'STRUCTURES' ? checkedStructures : checkedCryorama,
        plugin,
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

  const onCheck = (serverId: number, plugin: 'STRUCTURES' | 'CRYORAMA') => {
    if (plugin === 'STRUCTURES') {
      if (checkedStructures.includes(serverId)) {
        setCheckedStructures(checkedStructures.filter((id) => id !== serverId));
      } else {
        setCheckedStructures([...checkedStructures, serverId]);
      }
    } else if (plugin === 'CRYORAMA') {
      if (checkedCryorama.includes(serverId)) {
        setCheckedCryorama(checkedCryorama.filter((id) => id !== serverId));
      } else {
        setCheckedCryorama([...checkedCryorama, serverId]);
      }
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
                {data?.structureStatuses.servers.map((server) => {
                  return (
                    <TableRow key={`server-key1-${server.id}`}>
                      <TableCell className="py-1">
                        <Checkbox
                          onCheckedChange={() => onCheck(server.id, 'STRUCTURES')}
                          checked={checkedStructures.includes(server.id)}
                        />
                      </TableCell>
                      <TableCell>
                        {server.name}
                        {server.isX5 && ' (X5)'}
                      </TableCell>
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
                <Button variant="positive" onClick={() => onUpdate('ADD', 'STRUCTURES')} disabled={isUpdating}>
                  Add Teleporter
                </Button>
                <Button variant="destructive" onClick={() => onUpdate('REMOVE', 'STRUCTURES')} disabled={isUpdating}>
                  Remove Teleporter
                </Button>
              </div>
              <Button className="w-full" onClick={handleRefetch} disabled={isRefetching || isUpdating}>
                Refresh
              </Button>
            </div>
          </div>
        </ItemWrapper>
        <ItemWrapper title="Cryorama Plugin" description="Control the config for the Cryorama Plugin">
          <div className="max-w-md space-y-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Selected</TableHead>
                  <TableHead>Map</TableHead>
                  <TableHead>Spacewhale</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.cryoramaStatuses.servers.map((server) => {
                  return (
                    <TableRow key={`server-key2-${server.id}`}>
                      <TableCell className="py-1">
                        <Checkbox
                          onCheckedChange={() => onCheck(server.id, 'CRYORAMA')}
                          checked={checkedCryorama.includes(server.id)}
                        />
                      </TableCell>
                      <TableCell>
                        {server.name}
                        {server.isX5 && ' (X5)'}
                      </TableCell>
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
                <Button variant="positive" onClick={() => onUpdate('ADD', 'CRYORAMA')} disabled={isUpdating}>
                  Add Spacewhale
                </Button>
                <Button variant="destructive" onClick={() => onUpdate('REMOVE', 'CRYORAMA')} disabled={isUpdating}>
                  Remove Spacewhale
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
                    <TableCell>
                      {server.name}
                      {server.isX5 && ' (X5)'}
                    </TableCell>
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
