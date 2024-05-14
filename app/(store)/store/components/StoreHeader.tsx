import { FaDiscord, FaGamepad } from 'react-icons/fa';
import Link from 'next/link';

const StoreHeader = () => {
  return (
    <div className="flex flex-col space-y-6 md:flex-row md:justify-between md:space-y-0">
      <div>
        <p className="text-sm text-muted-foreground">Welcome to the</p>
        <h1 className="text-4xl font-bold">Friendly Network Store</h1>
        <div className="mt-2 max-w-xl space-y-2">
          <p className="text-muted-foreground">
            Friendly Network is a community for all people that want to enjoy playing without grinding and just having
            fun. We have a store so you can improve the quality of the servers and keep them running.
          </p>
          <p className="text-muted-foreground">
            In this store you can find ranks and points to increase your fun in game.
          </p>
        </div>
      </div>
      <div className="space-y-4">
        <Link
          className="flex items-center space-x-4 rounded-xl border bg-muted/50 px-8 py-4 transition-colors hover:border-primary"
          href="/#join-links"
        >
          <div>
            <FaGamepad className="h-12 w-12" />
          </div>
          <div className="flex flex-col">
            <span className="font-lg font-semibold">Friendly Fibercraft</span>
            <span className="text-muted-foreground">Click to see the join links</span>
          </div>
        </Link>
        <Link
          className="flex items-center space-x-4 rounded-xl border bg-muted/50 px-8 py-4 transition-colors hover:border-primary"
          href="/#discord"
        >
          <div>
            <FaDiscord className="h-12 w-12" />
          </div>
          <div className="flex flex-col">
            <span className="font-lg font-semibold">Discord Community</span>
            <span className="text-muted-foreground">Click to see our Discord</span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default StoreHeader;
