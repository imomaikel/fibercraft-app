'use client';
import ManagementPageWrapper from '../components/ManagementPageWrapper';
import EventsControl from './components/EventsControl';
import StaffControl from './components/StaffControl';

const ManagementWebsiteControlPage = () => {
  return (
    <ManagementPageWrapper pageLabel="Website Control">
      <div className="space-y-6">
        <StaffControl />
        <EventsControl />
      </div>
    </ManagementPageWrapper>
  );
};

export default ManagementWebsiteControlPage;
