import { default as NotFoundComponent } from '@assets/components/NotFound';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 Not Found',
};

export default function NotFound() {
  return <NotFoundComponent className="fixed inset-0 mt-0" />;
}
