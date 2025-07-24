import { z } from 'zod';

export const UserSchema = z.object({
  id: z.uuid().optional(),
  companyId: z.uuid({ message: 'companyId must be a valid UUID' }).optional(),
  email: z.email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['OWNER', 'OPERATOR', 'VIEWER']).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional(),
});

export type UserInput = z.infer<typeof UserSchema>;
