import { CreateExpressContextOptions, createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from '../app/(assets)/trpc/trpc-router';
import { nextApp, nextRequestHandler } from '../app/next';
import { inferAsyncReturnType } from '@trpc/server';
import { getPort } from '../app/(assets)/lib/utils';
import { IncomingMessage } from 'node:http';
import buildNextApp from 'next/dist/build';
import webhookHandler from './webhooks';
import bodyParser from 'body-parser';
import express from 'express';

// Create express server
const app = express();
const PORT = getPort();
const expressContext = ({ req, res }: CreateExpressContextOptions) => ({
  req,
  res,
});
export type ExpressContext = inferAsyncReturnType<typeof expressContext>;
export type TWebhookRequest = IncomingMessage & { rawBody: Buffer };

// Initialize app and server
(() => {
  process.env.TZ = 'Europe/Berlin';
  // Build the app
  if (process.env.NEXT_BUILD) {
    app.listen(PORT, async () => {
      // @ts-expect-error Build from directory
      await buildNextApp(process.cwd());
      process.exit();
    });
    return;
  }

  // Create tRPC
  app.use(
    '/trpc',
    createExpressMiddleware({
      router: appRouter,
      createContext: expressContext,
    }),
  );

  // Listen for webhooks
  app.use(
    '/api/webhooks',
    bodyParser.json({
      verify: (req: TWebhookRequest, _, buf) => {
        req.rawBody = buf;
      },
    }),
    webhookHandler,
  );

  // Start the app
  app.use((req, res) => nextRequestHandler(req, res));
  nextApp.prepare().then(() => {
    app.listen(PORT, async () => {
      console.log(`Next.js started. ${process.env.NEXT_PUBLIC_SERVER_URL}`);
    });
  });

  // Start the bot
  import('../bot/client');
})();
