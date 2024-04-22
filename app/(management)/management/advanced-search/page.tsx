'use client';
import ManagementPageWrapper from '../components/ManagementPageWrapper';
import { ReadonlyURLSearchParams, usePathname, useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@ui/tabs';
import CommandEntry from './components/CommandEntry';
import ItemWrapper from '../components/ItemWrapper';
import { relativeDate } from '@assets/lib/utils';
import { useEventListener } from 'usehooks-ts';
import DataEntry from './components/DataEntry';
import { secondsToHours } from 'date-fns';
import { Separator } from '@ui/separator';
import { motion } from 'framer-motion';
import { Button } from '@ui/button';
import { trpc } from '@trpc/index';
import { Input } from '@ui/input';
import { Suspense, useState } from 'react';
import SearchParams from './SearchParams';

const METHODS = ['Steam ID', 'Player ID', 'Discord ID', 'Character', 'Tribe'] as const;

const ManagementAdvancedSearch = () => {
  const [data, setData] = useState<
    {
      characterName?: string | undefined;
      characterNameFallback?: string | undefined;
      lastLogin?: number | undefined;
      map?: string | undefined;
      playerId?: number | undefined;
      playTime?: number | undefined;
      steamId?: string | undefined;
      tribeId?: number | undefined | null;
      tribeName?: string | undefined | null;
      discordId?: string | undefined | null;
      members?: {
        characterName?: string | undefined;
        characterNameFallback?: string | undefined;
        playerId?: number | undefined;
        steamId?: string | undefined;
        tribeName?: string | undefined;
        playTime?: number | undefined;
        lastLogin?: number | undefined;
        map?: string | undefined;
        tribeId?: number | undefined;
      }[];
    }[]
  >();
  const [punishmentCommand, setPunishmentCommand] = useState<null | { command: string; error: null | string }>();
  const [index, setIndex] = useState<{ count: number; active: number } | null>(null);
  const [method, setMethod] = useState<(typeof METHODS)[number]>('Steam ID');
  const [searchString, setSearchString] = useState('');
  const [searchParams, setSearchParams] = useState<null | ReadonlyURLSearchParams>();

  const pathname = usePathname();
  const router = useRouter();

  const { mutate: advancedSearch, isLoading } = trpc.management.advancedSearch.useMutation();

  const handleSearch = () => {
    advancedSearch(
      { method, searchString },
      {
        onSuccess: (searchData) => {
          if (!searchData) return;
          setIndex({
            active: 0,
            count: searchData.result.length,
          });
          setData(searchData.result);
        },
      },
    );
  };

  const generatePunishmentCommand = () => {
    if (method !== 'Tribe' || index === null || !data) return;
    const members = (data[index.active].members || []).filter(
      (member) =>
        (member.characterName && member.characterName.length >= 1) ||
        (member.characterNameFallback && member.characterNameFallback.length >= 1),
    );

    const diffMembers = (data[index.active].members || []).length - members.length;

    const names = members
      .map((member) => {
        if (member.characterName && member.characterName.length >= 1) {
          return member.characterName;
        } else if (member.characterNameFallback && member.characterNameFallback.length >= 1) {
          return member.characterNameFallback;
        }
        return '';
      })
      .join(' | ');
    const ids = members.map((member) => member.steamId).join(' | ');
    const tribeName = data[index.active].tribeName;
    const command = `/punishment names:${names} ids:${ids} tribename:${tribeName} reason: punishment: warning_type: warnings: proof:`;

    setPunishmentCommand({
      command,
      error: diffMembers !== 0 ? `Failed to get character name of ${diffMembers} players!` : null,
    });
  };

  useEventListener('keydown', (event) => {
    if (event.key === 'Enter') handleSearch();
  });

  const handleMethodChange = (newMethod: string) => {
    const params = searchParams ? new URLSearchParams(searchParams) : new URLSearchParams();
    params.set('method', newMethod);
    router.replace(`${pathname}?${params}`);

    setMethod(newMethod as (typeof METHODS)[number]);
  };

  const nextPage = () => {
    if (!index) return;
    setIndex({
      active: index.active + 1,
      count: index.count,
    });
    if (punishmentCommand) {
      setPunishmentCommand(null);
    }
  };
  const previousPage = () => {
    if (!index) return;
    setIndex({
      active: index.active - 1,
      count: index.count,
    });
    if (punishmentCommand) {
      setPunishmentCommand(null);
    }
  };

  return (
    <>
      <Suspense>
        <SearchParams
          onMethodChange={(newMethod) => setMethod(newMethod)}
          onSearchParamsChange={(params) => setSearchParams(params)}
        />
      </Suspense>
      <ManagementPageWrapper pageLabel="Advanced Search">
        <ItemWrapper title="Search method" description="Choose a methodology for exploration">
          <Tabs value={method} onValueChange={handleMethodChange}>
            <div className="max-w-[90vw] overflow-x-auto rounded-lg pb-1">
              <TabsList>
                {METHODS.map((entry) => (
                  <TabsTrigger value={entry} key={entry}>
                    {entry}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            <div className="mt-4 flex max-w-sm items-center space-x-2">
              <Input
                placeholder="Enter something to search..."
                type="text"
                value={searchString}
                onChange={(e) => setSearchString(e.target.value)}
                disabled={isLoading}
              />
              <Button onClick={handleSearch} disabled={isLoading}>
                Search
              </Button>
            </div>
            {index && (
              <div className="my-12 flex max-w-xs flex-col">
                <span className="text-lg font-semibold">
                  Found {index.count} result{index.count >= 2 && 's'}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <Button disabled={index.active - 1 <= -1} onClick={previousPage}>
                    Previous
                  </Button>
                  <Button disabled={index.active + 1 >= index.count} onClick={nextPage}>
                    Next
                  </Button>
                </div>
                <span className="mt-2 text-center font-medium tracking-wide">
                  Page {index.active + 1} / {index.count}
                </span>
              </div>
            )}
            {data &&
              data.length >= 1 &&
              data.map((entry, idx) => {
                if (!index) return null;
                if (idx !== index.active) return null;
                const members = entry.members || [];
                const playerPlayTime = entry?.playTime || 0;
                const playerPlayerId = entry.playerId || null;
                const playerTribeId = entry.tribeId || null;

                return (
                  <motion.div
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                    transition={{
                      duration: 0.5,
                    }}
                    viewport={{ once: true }}
                    key={`data-${idx}`}
                  >
                    <div className="flex flex-wrap gap-4">
                      {entry?.characterName && <DataEntry value={entry.characterName} title="Character name" />}
                      {!entry?.characterName && entry?.characterNameFallback && (
                        <DataEntry value={entry.characterNameFallback} title="Character name" />
                      )}

                      {entry?.lastLogin && (
                        <DataEntry value={relativeDate(new Date(entry.lastLogin * 1000))} title="Last login" />
                      )}
                      {entry?.map && <DataEntry value={entry.map} title="Last map" />}
                      {playerPlayerId && <DataEntry value={playerPlayerId} title="Player ID" />}
                      {playerPlayTime >= 1 && (
                        <DataEntry value={`${secondsToHours(playerPlayTime)} hours`} title="Play time" />
                      )}
                      {entry?.steamId && <DataEntry value={entry.steamId} title="Steam ID" />}
                      {playerTribeId && <DataEntry value={playerTribeId} title="Tribe ID" />}
                      {entry?.tribeName && <DataEntry value={entry.tribeName} title="Tribe Name" />}
                      {entry?.discordId && <DataEntry value={entry.discordId} title="Discord ID" />}
                    </div>
                    <div className="mt-4 flex flex-col space-y-6">
                      {members.length >= 1 && (
                        <p className="text-lg font-semibold">
                          Member list: <span>({members.length})</span>
                        </p>
                      )}
                      {members.length >= 1 &&
                        members.map((member, memberIndex) => {
                          const playTime = member.playTime || 0;
                          return (
                            <div key={`${entry.tribeId}${memberIndex}`} className="flex flex-wrap items-center gap-4">
                              {member?.characterName && (
                                <DataEntry value={member.characterName} title="Character name" />
                              )}
                              {!member?.characterName && member?.characterNameFallback && (
                                <DataEntry value={member.characterNameFallback} title="Character name" />
                              )}
                              {member?.playerId && <DataEntry value={member.playerId} title="Player ID" />}
                              {member?.steamId && <DataEntry value={member.steamId} title="Steam ID" />}
                              <DataEntry value={`${secondsToHours(playTime)} hours`} title="Play time" />
                              {member?.lastLogin && (
                                <DataEntry value={relativeDate(new Date(member.lastLogin * 1000))} title="Last login" />
                              )}
                              {member?.map && <DataEntry value={member.map} title="Last map" />}
                              <Separator />
                            </div>
                          );
                        })}

                      {members.length >= 1 && (
                        <div className="flex flex-col space-y-1">
                          <p className="text-lg font-semibold">Punishment command</p>
                          <Button onClick={generatePunishmentCommand} className="max-w-xs">
                            Generate
                          </Button>
                          {punishmentCommand?.error && (
                            <span className="!my-2 text-lg font-semibold text-destructive">
                              {punishmentCommand.error}
                            </span>
                          )}
                          {punishmentCommand?.command && <CommandEntry value={punishmentCommand.command} />}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
          </Tabs>
        </ItemWrapper>
      </ManagementPageWrapper>
    </>
  );
};

export default ManagementAdvancedSearch;
