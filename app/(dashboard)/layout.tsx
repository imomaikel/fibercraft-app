import Cart from '@assets/components/Cart';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="pt-[72px]">{children}</div>
      <Cart />
    </>
  );
};

export default DashboardLayout;
