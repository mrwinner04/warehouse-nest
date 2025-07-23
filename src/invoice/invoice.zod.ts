import { z } from 'zod';

export const InvoiceSchema = z.object({
  id: z.uuid().optional(),
  companyId: z.uuid({ message: 'companyId must be a valid UUID' }),
  orderId: z.uuid({ message: 'orderId must be a valid UUID' }),
  number: z.string().min(1, 'Invoice number is required'),
  status: z.string().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional(),
  modifiedBy: z.uuid().optional(),
});

export type InvoiceInput = z.infer<typeof InvoiceSchema>;
