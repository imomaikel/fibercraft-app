import SessionWrapper from '@assets/components/SessionWrapper';
import MobileNavbar from '@assets/components/MobileNavbar';
import { Provider } from '@assets/trpc/Provider';
import Navbar from '@assets/components/Navbar';
import { Inter } from 'next/font/google';
import { cn } from '@assets/lib/utils';
import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import './(assets)/globals.css';
import Footer from './Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Friendly Fibercraft',
  description: 'Your ARK Servers',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark overflow-x-hidden">
      <body className={cn(inter.className, 'relative min-h-screen w-full overflow-x-hidden bg-background')}>
        <Provider>
          <SessionWrapper>
            <div className="mx-auto max-w-screen-2xl pb-16">
              <Navbar />
              <MobileNavbar />
              <Toaster richColors position="bottom-right" />
              <div className="px-2 md:px-6">{children}</div>
            </div>
            <Footer />
          </SessionWrapper>
        </Provider>
      </body>
    </html>
  );
}
