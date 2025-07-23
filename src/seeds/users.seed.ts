import { DataSource, Repository } from 'typeorm';
import { UserEntity, UserRole } from '../user/user.entity/user.entity';
import * as bcrypt from 'bcryptjs';

export async function seedUsers(
  dataSource: DataSource,
  companies: { id: string }[],
) {
  const userRepo: Repository<UserEntity> = dataSource.getRepository(UserEntity);

  // --- Users ---
  const password = await bcrypt.hash('password123', 10);
  const users = [
    userRepo.create({
      companyId: companies[0].id,
      email: 'owner@acme.com',
      password,
      name: 'Acme Owner',
      role: UserRole.OWNER,
    }),
    userRepo.create({
      companyId: companies[1].id,
      email: 'admin@globex.com',
      password,
      name: 'Globex Admin',
      role: UserRole.OWNER,
    }),
    userRepo.create({
      companyId: companies[2].id,
      email: 'manager@initech.com',
      password,
      name: 'Initech Manager',
      role: UserRole.OPERATOR,
    }),
    userRepo.create({
      companyId: companies[3].id,
      email: 'viewer@umbrella.com',
      password,
      name: 'Umbrella Viewer',
      role: UserRole.VIEWER,
    }),
  ];
  await userRepo.save(users);

  console.log('Seeded users');
  return users;
}
