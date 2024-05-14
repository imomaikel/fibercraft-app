'use client';
import StoreHeader from './components/StoreHeader';
import Products from './components/Products';
import Events from './components/Events';

const StoreLandingPage = () => {
  return (
    <div>
      <div>
        <StoreHeader />
      </div>

      <div className="mt-8">
        <Events />
      </div>

      <div className="mt-6">
        <Products />
      </div>
    </div>
  );
};

export default StoreLandingPage;
