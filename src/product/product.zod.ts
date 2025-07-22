import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.uuid().optional(),
  companyId: z.uuid({ message: 'companyId must be a valid UUID' }),
  name: z.string().min(1, 'Product name is required'),
  code: z.string().optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Price must be a valid decimal'),
  type: z.enum(['solid', 'liquid']),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional(),
  modifiedBy: z.uuid().optional(),
});

export type ProductInput = z.infer<typeof ProductSchema>;
