import { z } from 'zod';

export const OrderSchema = z.object({
  id: z.uuid().optional(),

  companyId: z.uuid({ message: 'companyId must be a valid UUID' }),

  number: z.string().min(1, 'Order number is required'),

  type: z.enum(['sales', 'purchase', 'transfer']),

  customerId: z.uuid({ message: 'customerId must be a valid UUID' }),

  warehouseId: z.uuid({ message: 'warehouseId must be a valid UUID' }),

  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional(),

  modifiedBy: z.uuid().optional(),
});

export type OrderInput = z.infer<typeof OrderSchema>;
