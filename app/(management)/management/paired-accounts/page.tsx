'use client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui/table';
import ManagementPageWrapper from '../components/ManagementPageWrapper';
import ItemWrapper from '../components/ItemWrapper';
import { useDebounceValue } from 'usehooks-ts';
import { ImSpinner4 } from 'react-icons/im';
import { cn } from '@assets/lib/utils';
import { trpc } from '@trpc/index';
import { Input } from '@ui/input';
import { useEffect } from 'react';
import { toast } from 'sonner';

const ManagementPairedAccountsPage = () => {
  const [debouncedSearch, setSearch] = useDebounceValue('', 200);

  const { mutate: getPairedAccounts, data: accounts, isLoading } = trpc.management.getPairedAccounts.useMutation();

  useEffect(() => {
    if (debouncedSearch.length < 2) return;
    getPairedAccounts({ searchText: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleCopy = (value: string) => {
    window.navigator.clipboard
      .writeText(value)
      .then(() => {
        toast.info(`Copied "${value}"`);
      })
      .catch(() => {
        toast.error('Failed to copy!');
      });
  };

  return (
    <ManagementPageWrapper pageLabel="Paired Accounts">
      <ItemWrapper title="Search for users" description="Search by Steam ID or username. At least two characters.">
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Input
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-md"
              placeholder="Type to search..."
            />
            <ImSpinner4 className={cn('invisible h-8 w-8', isLoading && 'visible animate-spin')} />
          </div>
          <div>
            {accounts && (
              <Table className="max-w-lg">
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Steam ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.length >= 1 ? (
                    accounts.map((entry) => (
                      <TableRow key={entry.steamId}>
                        <TableCell
                          className="cursor-pointer transition-colors hover:text-primary"
                          onClick={() => handleCopy(entry.playerName)}
                        >
                          {entry.playerName}
                        </TableCell>
                        <TableCell
                          className="cursor-pointer transition-colors hover:text-primary"
                          onClick={() => handleCopy(entry.steamId)}
                        >
                          {entry.steamId}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center">
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </ItemWrapper>
    </ManagementPageWrapper>
  );
};

export default ManagementPairedAccountsPage;
