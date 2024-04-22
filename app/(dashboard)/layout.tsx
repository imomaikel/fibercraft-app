import Cart from '@assets/components/Cart';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="pb-16 pt-[88px] md:pb-6">{children}</div>
      <Cart />
    </>
  );
};

export default DashboardLayout;
