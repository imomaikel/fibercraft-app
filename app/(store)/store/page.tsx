'use client';
import TopDonators from './components/TopDonators';
import StoreHeader from './components/StoreHeader';
import Products from './components/Products';
import Events from './components/Events';

const StoreLandingPage = () => {
  return (
    <div>
      <div>
        <StoreHeader />
      </div>

      <div className="mt-8 flex flex-col space-y-6 2xl:flex-row 2xl:justify-between 2xl:space-y-0">
        <Events />
        <TopDonators />
      </div>

      <div className="mt-6">
        <Products />
      </div>
    </div>
  );
};

export default StoreLandingPage;
