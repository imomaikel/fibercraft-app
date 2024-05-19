import AuthorizeToast from '@store/components/AuthorizeToast';
import { Suspense } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Store',
    template: '%s | Friendly Fibercraft',
  },
  description:
    'Friendly Network is a community meant to be fun for everyone. We try to keep it fair for everyone. We try to not make it a pay to win server but we do have the option to donate. This can be done to buy ranks or to buy points. All income from the server will be put into the server to improve the plugins or server status.',
};

const StoreLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="px-2 pb-16 pt-[88px]">{children}</div>

      <Suspense>
        <AuthorizeToast />
      </Suspense>
    </>
  );
};

export default StoreLayout;
