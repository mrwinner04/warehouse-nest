import { z } from 'zod';

export const CustomerSchema = z.object({
  id: z.uuid().optional(),

  companyId: z.string().optional(),

  type: z.enum(['customer', 'supplier']),

  name: z.string().min(1, 'Customer name is required'),

  email: z.email().optional(),

  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional(),

  modifiedBy: z.uuid().optional(),
});

export type CustomerInput = z.infer<typeof CustomerSchema>;
