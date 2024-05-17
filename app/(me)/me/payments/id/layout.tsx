import { Suspense } from 'react';

const UserPaymentPageLayout = ({ children }: { children: React.ReactNode }) => {
  return <Suspense>{children}</Suspense>;
};

export default UserPaymentPageLayout;
