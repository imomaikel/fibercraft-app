'use client';
import { trpc } from '@trpc/index';
import ItemWrapper from '../components/ItemWrapper';
import AddUser from './components/AddUser';
import ManagementPageWrapper from '../components/ManagementPageWrapper';
import { useState } from 'react';
import { Button } from '@ui/button';

const ManagementPage = () => {
  const { data: users, isLoading: usersLoading } = trpc.management.getUsersWithPermissions.useQuery(undefined, {
    retry: 1,
  });
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);

  return (
    <>
      <ManagementPageWrapper pageLabel="Permissions">
        <div className="flex flex-col space-y-4">
          <ItemWrapper title="Current management staff" description="View or revoke permissions.">
            <div></div>
          </ItemWrapper>

          <ItemWrapper title="Add a new staff member" description="View or revoke permissions.">
            <div>
              <Button onClick={() => setAddUserDialogOpen(true)}>Add</Button>
            </div>
          </ItemWrapper>
        </div>
      </ManagementPageWrapper>
      <AddUser isOpen={addUserDialogOpen} handleClose={() => setAddUserDialogOpen(false)} />
    </>
  );
};

export default ManagementPage;
