'use client';
import StoreHeader from './components/StoreHeader';
import Products from './components/Products';

const StoreLandingPage = () => {
  return (
    <div>
      <div>
        <StoreHeader />
      </div>

      <div className="mt-6">
        <Products />
      </div>
    </div>
  );
};

export default StoreLandingPage;
