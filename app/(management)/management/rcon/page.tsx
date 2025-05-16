'use client';
import ManagementPageWrapper from '../components/ManagementPageWrapper';
import { ToggleGroup, ToggleGroupItem } from '@ui/toggle-group';
import CommandWindow from './components/CommandWindow';
import ItemWrapper from '../components/ItemWrapper';
import { errorToast } from '@assets/lib/utils';
import { Button } from '@ui/button';
import { trpc } from '@trpc/index';
import { Input } from '@ui/input';
import { useState } from 'react';

const ManagementRCON = () => {
  const [mapsData, setMapsData] = useState<
    {
      mapName: string;
      lastStatus: 'online' | 'offline';
      commands: {
        text: string;
        type: 'input' | 'response' | 'error';
      }[];
    }[]
  >([]);
  const [command, setCommand] = useState('');

  const { mutate: executeRcon, isLoading: rconExecuting } = trpc.management.executeRcon.useMutation();
  const { data: servers, isLoading: serversLoading } = trpc.publicRouter.getServers.useQuery(undefined, {
    refetchInterval: 3_000,
    onSuccess: (response) => {
      let changed = false;
      const updatedMaps = mapsData.map((entry) => {
        const currentStatus = response.find(({ mapName }) => mapName === entry.mapName)?.lastStatus;
        if (currentStatus) {
          if (entry.lastStatus !== currentStatus) {
            changed = true;
          }
          return { ...entry, lastStatus: currentStatus };
        } else {
          return entry;
        }
      });
      if (changed) {
        setMapsData(updatedMaps);
      }
    },
  });

  const handleMapsUpdate = (maps: string[]) => {
    const withoutDisabledMaps = mapsData.filter((entry) => maps.includes(entry.mapName));
    const enabledMaps = withoutDisabledMaps.map(({ mapName }) => mapName);

    for (const map of maps) {
      if (!enabledMaps.includes(map)) {
        withoutDisabledMaps.push({
          commands: [],
          lastStatus: servers?.find((e) => e.mapName === map)?.lastStatus || 'offline',
          mapName: map,
        });
      }
    }

    setMapsData(withoutDisabledMaps);
  };

  const handleErase = (mapName: string) => {
    setMapsData(
      mapsData.map((entry) => {
        if (entry.mapName === mapName) {
          return {
            ...entry,
            commands: [],
          };
        } else {
          return entry;
        }
      }),
    );
  };

  const handleCommandSend = () => {
    const maps = mapsData.map(({ mapName }) => mapName);

    if (maps.length <= 0) {
      return errorToast('Please select at least one map.');
    }

    if (command.length <= 1) {
      return errorToast('The command is too short.');
    }

    executeRcon(
      {
        command,
        maps,
      },
      {
        onSuccess: (response) => {
          if (!response.success) {
            return errorToast();
          }

          setMapsData(
            mapsData.map((entry) => {
              const commands = entry.commands;
              commands.push({
                text: command,
                type: 'input',
              });
              if (response.failedToConnect.includes(entry.mapName)) {
                commands.push({
                  text: 'Failed to connect!',
                  type: 'error',
                });
              } else if (response.failedToExecute.includes(entry.mapName)) {
                commands.push({
                  text: 'Failed to execute!',
                  type: 'error',
                });
              } else {
                const findResponse = response.executed.find(({ mapName }) => mapName === entry.mapName);
                if (findResponse) {
                  commands.push({
                    text: findResponse.response,
                    type: 'response',
                  });
                } else {
                  commands.push({
                    text: 'Failed to get response!',
                    type: 'error',
                  });
                }
              }
              return {
                ...entry,
                commands,
              };
            }),
          );
        },
        onError: () => errorToast(),
      },
    );
  };

  if (serversLoading) return null;

  return (
    <ManagementPageWrapper pageLabel="RCON Commands">
      <div className="space-y-6">
        <ItemWrapper title="Maps Selection" description="Select map(s) where the command should be executed.">
          <div>
            <ToggleGroup type="multiple" onValueChange={handleMapsUpdate} className="flex justify-start">
              {servers?.map((server, idx) => (
                <ToggleGroupItem value={server.mapName} key={`server-${idx}`} className="capitalize">
                  {server.mapName}
                  {server.isX5 ? ' (X5)' : ''}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </ItemWrapper>
        <ItemWrapper title="Command" description="Enter a command that you want to send.">
          <div className="flex max-w-md space-x-2">
            <Input value={command} onChange={(event) => setCommand(event.target.value)} />
            <Button onClick={handleCommandSend}>Send</Button>
          </div>
        </ItemWrapper>
        <ItemWrapper title="Terminal List" description="View command history for each map">
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {mapsData.map(({ commands, lastStatus, mapName }) => (
              <CommandWindow
                key={`cmd-${mapName}`}
                mapName={mapName}
                commands={commands}
                isLoading={rconExecuting}
                isOnline={lastStatus === 'online'}
                onErase={handleErase}
              />
            ))}
          </div>
        </ItemWrapper>
      </div>
    </ManagementPageWrapper>
  );
};

export default ManagementRCON;
