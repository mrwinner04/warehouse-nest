import { DataSource, Repository } from 'typeorm';
import { UserEntity, UserRole } from '../user/user.entity';
import * as bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';

export async function seedUsers(
  dataSource: DataSource,
  companies: { id: string }[],
) {
  const userRepo: Repository<UserEntity> = dataSource.getRepository(UserEntity);

  // --- Users ---
  const password = await bcrypt.hash('password123', 10);
  const users = companies.flatMap((company) => [
    userRepo.create({
      companyId: company.id,
      email: faker.internet.email(),
      password,
      name: faker.person.fullName(),
      role: UserRole.OWNER,
    }),
    userRepo.create({
      companyId: company.id,
      email: faker.internet.email(),
      password,
      name: faker.person.fullName(),
      role: UserRole.OPERATOR,
    }),
    userRepo.create({
      companyId: company.id,
      email: faker.internet.email(),
      password,
      name: faker.person.fullName(),
      role: UserRole.VIEWER,
    }),
  ]);
  await userRepo.save(users);

  console.log('Seeded users');
  return users;
}
