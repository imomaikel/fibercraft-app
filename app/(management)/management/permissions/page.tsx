'use client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui/table';
import ManagementPageWrapper from '../components/ManagementPageWrapper';
import UserAvatar from '@assets/components/UserAvatar';
import ItemWrapper from '../components/ItemWrapper';
import UserList from './components/UserList';
import { Button } from '@ui/button';
import { trpc } from '@trpc/index';
import { Badge } from '@ui/badge';
import { useState } from 'react';

const ManagementPage = () => {
  const { data: users } = trpc.management.getUsersWithPermissions.useQuery(undefined, {
    retry: 1,
  });
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);

  return (
    <>
      <ManagementPageWrapper pageLabel="Permissions">
        <div className="flex flex-col space-y-4">
          <ItemWrapper title="Current management staff" description="View all authored users.">
            <div>
              <Table className="w-fit">
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Permissions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user, index) => (
                    <TableRow key={`${index}user.discordId`}>
                      <TableCell className="md:min-w-[300px]">
                        <div className="flex items-center space-x-2">
                          <UserAvatar url={user.image} />
                          <span>{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.permissions.map(({ permission }) => (
                            <Badge key={`${user.discordId}${permission}`}>{permission.replace(/_/g, ' ')}</Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ItemWrapper>

          <ItemWrapper title="Manage access" description="Add, view or remove permissions.">
            <Button onClick={() => setAddUserDialogOpen(true)} className="max-w-sm">
              Manage access
            </Button>
          </ItemWrapper>
        </div>
      </ManagementPageWrapper>
      <UserList
        isOpen={addUserDialogOpen}
        handleClose={() => setAddUserDialogOpen(false)}
        currentUsers={users?.map((user) => ({ avatar: user.image!, label: user.name!, value: user.discordId! })) || []}
      />
    </>
  );
};

export default ManagementPage;
