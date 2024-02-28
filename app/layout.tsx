import { Provider } from '@assets/trpc/Provider';
import Navbar from '@assets/components/Navbar';
import { Inter } from 'next/font/google';
import { cn } from '@assets/lib/utils';
import type { Metadata } from 'next';
import './(assets)/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Friendly Fibercraft',
  description: 'Your ARK Servers',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={cn(inter.className, 'w-screen overflow-x-hidden bg-background')}>
        <Provider>
          <div className="mx-auto max-w-screen-xl">
            <Navbar />
            <div>{children}</div>
          </div>
        </Provider>
      </body>
    </html>
  );
}
