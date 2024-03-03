'use client';
import ManagementPageWrapper from '../ManagementPageWrapper';
import ItemWrapper from '../components/ItemWrapper';

const ManagementPage = () => {
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
    </>
  );
};

export default ManagementPage;
