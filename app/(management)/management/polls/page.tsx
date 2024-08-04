'use client';
import ManagementPageWrapper from '../components/ManagementPageWrapper';
import ItemWrapper from '../components/ItemWrapper';
import PollCreator from './components/PollCreator';

const ManagementPanelPollsPage = () => {
  return (
    <ManagementPageWrapper pageLabel="Polls">
      <div>
        {/* Previous Polls */}
        <div></div>
        {/* New Poll */}
        <ItemWrapper title="Add a new Poll">
          <PollCreator />
        </ItemWrapper>
      </div>
    </ManagementPageWrapper>
  );
};

export default ManagementPanelPollsPage;
