'use client';
import { trpc } from '@trpc/index';
import ManagementPageWrapper from '../ManagementPageWrapper';
import ItemWrapper from '../components/ItemWrapper';
import AddUser from './components/AddUser';

const ManagementPage = () => {
  const { data: users, isLoading: usersLoading } = trpc.management.getUsersWithPermissions.useQuery(undefined, {
    retry: 1,
  });

  return (
    <>
      <ManagementPageWrapper pageLabel="Permissions">
        <div className="flex flex-col space-y-4">
          <ItemWrapper title="Current management staff" description="View or revoke permissions.">
            <div></div>
          </ItemWrapper>

          <ItemWrapper title="Current management staff" description="View or revoke permissions.">
            <div></div>
          </ItemWrapper>
        </div>
      </ManagementPageWrapper>
      <AddUser />
    </>
  );
};

export default ManagementPage;
