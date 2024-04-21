'use client';
import ManagementPageWrapper from '../components/ManagementPageWrapper';
import StaffControl from './components/StaffControl';

const ManagementWebsiteControlPage = () => {
  return (
    <ManagementPageWrapper pageLabel="Website Control">
      <StaffControl />
    </ManagementPageWrapper>
  );
};

export default ManagementWebsiteControlPage;
