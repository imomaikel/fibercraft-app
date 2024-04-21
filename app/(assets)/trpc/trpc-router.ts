import { managementRouter } from './management-router';
import { publicRouter } from './public-router';
import { router } from './trpc';

export const appRouter = router({
  management: managementRouter,
  publicRouter: publicRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
