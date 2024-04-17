'use client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui/table';
import ManagementPageWrapper from '../components/ManagementPageWrapper';
import ServerPicker from './components/ServerPicker';
import ItemWrapper from '../components/ItemWrapper';
import { Checkbox } from '@ui/checkbox';
import { Button } from '@ui/button';
import { trpc } from '@trpc/index';
import { Badge } from '@ui/badge';
import { useState } from 'react';
import { toast } from 'sonner';

const METHODS = ['start', 'stop', 'restart'] as const;
type TMethod = (typeof METHODS)[number];

const ManagementServerControlPage = () => {
  const { data: servers, isLoading, isRefetching, refetch } = trpc.management.getServers.useQuery();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [method, setMethod] = useState<TMethod | null>();

  const serversToStart = servers?.filter((entry) => entry.lastStatus === 'offline');
  const serversToStop = servers?.filter((entry) => entry.lastStatus === 'online');
  const serversToRestart = serversToStop;
  const totalPlayers = servers
    ? servers.reduce((acc, curr) => (acc += curr.lastStatus === 'online' ? curr.lastPlayers : 0), 0)
    : 0;

  const handleRefresh = () => {
    refetch().then(() => toast.info('Servers updated!'));
  };

  const handleDialog = (actionMethod: TMethod) => {
    setMethod(actionMethod);
    setIsDialogOpen(true);
  };

  return (
    <>
      <ManagementPageWrapper pageLabel="Server Control">
        <div className="space-y-4">
          <ItemWrapper title="Current statuses">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Map</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Auto Restart</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Players</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {servers && servers.length >= 1 ? (
                  servers.map(
                    // TODO position
                    ({ autoRestart, customName, gameMode, gameType, id, lastPlayers, lastStatus, mapName }) => (
                      <TableRow key={id}>
                        <TableCell>
                          {customName && customName.length >= 2 ? `${mapName}(${customName})` : mapName}
                        </TableCell>
                        <TableCell>
                          {gameType}/{gameMode}
                        </TableCell>
                        <TableCell>
                          <Checkbox checked={!!autoRestart} />
                        </TableCell>
                        <TableCell>
                          <Badge variant={lastStatus === 'offline' ? 'destructive' : 'default'}>{lastStatus}</Badge>
                        </TableCell>
                        <TableCell>{lastStatus === 'offline' ? '0' : lastPlayers}</TableCell>
                      </TableRow>
                    ),
                  )
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      {isLoading ? 'Loading servers...' : 'No servers found.'}
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && (
                  <TableRow>
                    <TableCell colSpan={3} />
                    <TableCell className="whitespace-nowrap">Total Players</TableCell>
                    <TableCell>{totalPlayers}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ItemWrapper>
          <ItemWrapper title="Controls" description="Start, stop, or restart servers.">
            <div className="mt-1 flex flex-wrap gap-4">
              {serversToStart && serversToStart.length >= 1 && (
                <Button
                  className="w-[200px] uppercase"
                  variant="positive"
                  disabled={isLoading}
                  onClick={() => handleDialog('start')}
                >
                  Start
                </Button>
              )}
              {serversToStop && serversToStop.length >= 1 && (
                <Button
                  className="w-[200px] uppercase"
                  variant="destructive"
                  disabled={isLoading}
                  onClick={() => handleDialog('stop')}
                >
                  Stop
                </Button>
              )}
              {serversToRestart && serversToRestart.length >= 1 && (
                <Button
                  className="w-[200px] uppercase"
                  variant="default"
                  disabled={isLoading}
                  onClick={() => handleDialog('restart')}
                >
                  Restart
                </Button>
              )}
              {!isLoading && (
                <Button
                  className="w-[200px] uppercase"
                  variant="secondary"
                  disabled={isRefetching}
                  onClick={handleRefresh}
                >
                  Refresh
                </Button>
              )}
            </div>
          </ItemWrapper>
        </div>
      </ManagementPageWrapper>
      {method && servers && (
        <ServerPicker
          onClose={() => setIsDialogOpen(false)}
          open={isDialogOpen}
          method={method}
          servers={servers}
          refresh={handleRefresh}
        />
      )}
    </>
  );
};

export default ManagementServerControlPage;
