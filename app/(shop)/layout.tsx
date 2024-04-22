import Cart from '@assets/components/Cart';

const ShopLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="px-2 pb-16 pt-[88px]">{children}</div>
      <Cart />
    </>
  );
};

export default ShopLayout;
