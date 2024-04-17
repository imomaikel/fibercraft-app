'use client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@ui/dialog';
import { managementRouter } from '@trpc/management-router';
import { cn, errorToast } from '@assets/lib/utils';
import { inferRouterOutputs } from '@trpc/server';
import { useEffect, useState } from 'react';
import { Button } from '@ui/button';
import { trpc } from '@trpc/index';
import { Badge } from '@ui/badge';

type TServers = inferRouterOutputs<typeof managementRouter>['getServers'];

type TServerPicker = {
  open: boolean;
  onClose: () => void;
  servers: TServers;
  method: 'start' | 'stop' | 'restart';
  refresh: () => void;
};
const ServerPicker = ({ open, onClose, servers, method, refresh }: TServerPicker) => {
  const possibleServers =
    method === 'start'
      ? servers.filter((server) => server.lastStatus === 'offline')
      : servers.filter((server) => server.lastStatus === 'online');
  const [toExecute, setToExecute] = useState<number | 'all' | null>(null);
  const [isResponseOpen, setIsResponseOpen] = useState(false);
  const [response, setResponse] = useState<{ serverId: number; status: 'success' | 'error' }[]>([]);

  const { mutate: controlServers, isLoading } = trpc.management.controlServers.useMutation();

  useEffect(() => {
    setToExecute(null);
  }, [servers]);

  const handleResponseClose = () => {
    onClose();
    setIsResponseOpen(false);
  };

  const handleExecute = () => {
    if (!toExecute) return;

    controlServers(
      {
        method,
        serverId: toExecute,
      },
      {
        onSuccess: ({ error, success, responses }) => {
          if (error || !success) return errorToast();

          if (responses) {
            setResponse(responses);
            setIsResponseOpen(true);
            onClose();
            refresh();
          }
        },
        onError: (error) => errorToast(error.data),
      },
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={() => !isLoading && onClose()}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Server selection</DialogTitle>
            <DialogDescription>Select a server to {method?.toLowerCase()}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {possibleServers.map((server) => (
              <div
                key={server.id}
                className={cn(
                  'flex cursor-pointer flex-col items-center rounded-md border border-transparent bg-secondary p-4 transition-colors hover:border-primary',
                  toExecute === server.id && 'border-primary',
                )}
                onClick={() => setToExecute(server.id)}
              >
                <span>{server.mapName}</span>
                {server.customName && server.customName.length >= 2 && (
                  <span className="text-muted-foreground">{server.customName}</span>
                )}
              </div>
            ))}
            <div
              className={cn(
                'flex cursor-pointer flex-col items-center rounded-md border border-transparent bg-secondary p-4 transition-colors hover:border-primary',
                toExecute === 'all' && 'border-primary',
              )}
              onClick={() => setToExecute('all')}
            >
              <span className="font-semibold text-destructive">ALL SERVERS ABOVE</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" className="md:min-w-[100px]" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="md:min-w-[150px]"
              onClick={handleExecute}
              disabled={isLoading || !toExecute}
            >
              Execute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isResponseOpen} onOpenChange={handleResponseClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your Results</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {response.map(({ serverId, status }) => {
              const server = servers.find((entry) => entry.id === serverId);
              if (!server) return null;

              return (
                <div key={`${serverId}${status}`} className="relative flex items-center">
                  <div className="font-semibold">{server.mapName}</div>
                  <div className="mx-4 h-px w-full bg-primary opacity-50" />
                  <div>
                    <Badge variant={status === 'error' ? 'destructive' : 'default'}>
                      {status === 'error' ? 'Failed' : 'Success'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button className="w-full" variant="secondary" onClick={() => setIsResponseOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ServerPicker;
