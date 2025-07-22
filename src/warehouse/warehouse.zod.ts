import { z } from 'zod';

export const WarehouseSchema = z.object({
  id: z.uuid().optional(),
  companyId: z.uuid({ message: 'companyId must be a valid UUID' }),
  // Type is optional enum: 'solid' or 'liquid'
  type: z.enum(['solid', 'liquid']).optional(),
  name: z.string().min(1, 'Warehouse name is required'),
  address: z.string().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional(),
  modifiedBy: z.uuid().optional(),
});

export type WarehouseInput = z.infer<typeof WarehouseSchema>;
