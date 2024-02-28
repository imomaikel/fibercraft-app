import NavLinks from './NavLinks';
import Cart from './Cart';

const Navbar = () => {
  return (
    <div className="fixed left-0 h-16 w-screen bg-background/40 px-4 backdrop-blur-sm">
      <div className="relative mx-auto flex h-full w-full max-w-screen-xl items-center border-b">
        <header className="w-full">
          <nav>
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="text-3xl font-bold tracking-wide antialiased">Fibercraft</div>
                <div>
                  <NavLinks />
                </div>
              </div>
              <div>
                <div>
                  <Cart />
                </div>
                <div></div>
              </div>
            </div>
          </nav>
        </header>
      </div>
    </div>
  );
};

export default Navbar;
