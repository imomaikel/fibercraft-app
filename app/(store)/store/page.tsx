'use client';
import RecentPayments from './components/RecentPayments';
import TopDonators from './components/TopDonators';
import StoreHeader from './components/StoreHeader';
import Categories from './components/Categories';
import Events from './components/Events';

const StoreLandingPage = () => {
  return (
    <div>
      <div>
        <StoreHeader />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-4 xl:grid-cols-3 xl:gap-x-0">
        <div className="col-span-2 grid">
          <Events />
        </div>
        <div className="col-span-2 flex md:col-span-2 xl:col-span-1 xl:justify-end">
          <TopDonators />
        </div>
        <div className="col-span-2 grid xl:col-span-3">
          <RecentPayments />
        </div>
      </div>

      <div className="mt-12">
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-4xl font-bold">Store Categories</h2>
          <p className="z-10 text-sm text-muted-foreground">Select a category to see related packages</p>
        </div>
        <div className="mt-8">
          <Categories />
        </div>
      </div>
    </div>
  );
};

export default StoreLandingPage;
