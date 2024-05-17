'use client';
import PaymentsTable from './components/PaymentsTable';
import { trpc } from '@trpc/index';

const MyPaymentsPage = () => {
  const { data: payments, isLoading } = trpc.userRouter.getMyPayments.useQuery();

  if (isLoading) return null;

  return (
    <div>
      <h2 className="text-4xl font-bold">Your Payments</h2>
      <div className="mt-6 max-w-3xl">
        <PaymentsTable payments={payments || []} />
      </div>
    </div>
  );
};

export default MyPaymentsPage;
