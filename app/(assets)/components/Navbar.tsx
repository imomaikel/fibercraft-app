'use client';
import { useCurrentUser } from '@assets/hooks/useCurrentUser';
import { Separator } from '@ui/separator';
import UserProfile from './UserProfile';
import CartButton from './CartButton';
import NavLinks from './NavLinks';

const Navbar = () => {
  const { user } = useCurrentUser();
  const userPermissions = user?.permissions;

  return (
    <div className="fixed left-0 h-16 w-screen bg-background/40 px-4 backdrop-blur-sm">
      <div className="relative mx-auto flex h-full w-full max-w-screen-xl items-center border-b">
        <header className="w-full">
          <nav>
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="text-3xl font-bold tracking-wide antialiased">Fibercraft</div>
                <div>{userPermissions && <NavLinks userPermissions={userPermissions} />}</div>
              </div>
              <div className="flex items-center space-x-3">
                <div>
                  <UserProfile />
                </div>
                <Separator orientation="vertical" className="h-10" />
                <div>
                  <CartButton />
                </div>
              </div>
            </div>
          </nav>
        </header>
      </div>
    </div>
  );
};

export default Navbar;
