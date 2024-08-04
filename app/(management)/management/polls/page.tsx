'use client';
import ManagementPageWrapper from '../components/ManagementPageWrapper';
import ItemWrapper from '../components/ItemWrapper';
import PollCreator from './components/PollCreator';
import PollList from './components/PollList';
import { trpc } from '@trpc/index';

const ManagementPanelPollsPage = () => {
  const {
    data: polls,
    isLoading,
    refetch,
  } = trpc.management.getPolls.useQuery(undefined, {
    refetchInterval: 5_000,
  });

  return (
    <ManagementPageWrapper pageLabel="Polls">
      <div className="space-y-8">
        {/* Previous Polls */}
        <ItemWrapper title="Manage added polls">
          <PollList isLoading={isLoading} polls={polls} />
        </ItemWrapper>
        {/* New Poll */}
        <ItemWrapper title="Add a new Poll">
          <PollCreator refetch={refetch} />
        </ItemWrapper>
      </div>
    </ManagementPageWrapper>
  );
};

export default ManagementPanelPollsPage;
