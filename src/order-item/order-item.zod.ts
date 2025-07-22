import { z } from 'zod';

export const OrderItemSchema = z.object({
  id: z.uuid().optional(),
  orderId: z.uuid({ message: 'orderId must be a valid UUID' }),
  productId: z.uuid({ message: 'productId must be a valid UUID' }),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Price must be a valid decimal'),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional(),
  modifiedBy: z.uuid().optional(),
});

export type OrderItemInput = z.infer<typeof OrderItemSchema>;
