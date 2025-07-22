import { z } from 'zod';

export const CompanySchema = z.object({
  id: z.uuid().optional(),

  name: z.string().min(1, 'Company name is required'),

  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional(),

  modifiedBy: z.uuid().optional(),
});

export type CompanyInput = z.infer<typeof CompanySchema>;
