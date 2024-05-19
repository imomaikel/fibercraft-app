'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

const AuthorizeToast = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const success = searchParams.get('success');

  useEffect(() => {
    if (success === 'true') {
      const params = new URLSearchParams();
      params.delete('success');
      toast.success('Basket Authorized!');
      router.replace(`${pathname}${params}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success]);

  return <></>;
};

export default AuthorizeToast;
