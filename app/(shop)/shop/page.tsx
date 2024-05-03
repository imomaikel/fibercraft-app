'use client';
import ShopHeader from './components/ShopHeader';
import Products from './components/Products';

const ShopLandingPage = () => {
  return (
    <div>
      <div>
        <ShopHeader />
      </div>

      <div className="mt-6">
        <Products />
      </div>
    </div>
  );
};

export default ShopLandingPage;
