import { z } from 'zod'

export const transactionSchema = z.object({
  id: z.string(),
  date: z.string(),
  description: z.string().min(1),
  amount: z.number(),
  category: z.string().min(1),
  reference: z.string().optional(),
  status: z.enum(['pending', 'reviewed', 'flagged']),
})

export const findingSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().min(1),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  category: z.string().min(1),
  recommendation: z.string().min(1),
  status: z.enum(['open', 'resolved', 'accepted']),
})
