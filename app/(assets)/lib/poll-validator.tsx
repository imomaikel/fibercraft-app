import { z } from 'zod';

export const PollSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  channelId: z.string().min(1),
  expireAt: z.date().or(z.literal('')).optional(),
  scheduleSend: z.date().or(z.literal('')).optional(),
  ranks: z.array(
    z.object({
      roleName: z.string(),
      roleId: z.string(),
      pointsPerVote: z.number(),
      maxVotes: z.number(),
    }),
  ),
  options: z
    .array(
      z.object({
        id: z.number(),
        description: z.string(),
      }),
    )
    .min(2)
    .max(26),
});

export type TPollSchema = z.infer<typeof PollSchema>;
