import { managementRouter } from './management-router';
import { router } from './trpc';

export const appRouter = router({
  management: managementRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
