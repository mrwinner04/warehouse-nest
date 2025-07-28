import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { validateCompanyAccess } from '../common/company-access.utils';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async validatePassword(user: UserEntity, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  findAll(companyId: string): Promise<UserEntity[]> {
    return this.userRepository.find({ where: { companyId } });
  }

  async findOne(
    id: string,
    companyId: string,
  ): Promise<Omit<UserEntity, 'password'>> {
    const user = await validateCompanyAccess(
      () =>
        this.userRepository.findOne({
          where: { id },
          select: [
            'id',
            'email',
            'name',
            'role',
            'companyId',
            'createdAt',
            'updatedAt',
            'deletedAt',
          ],
          relations: ['company'],
        }),
      companyId,
      'User',
    );

    // Transform to exclude password while keeping company relation
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId,
      company: user.company,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    };
  }

  async update(
    id: string,
    data: Partial<UserEntity>,
    companyId: string,
  ): Promise<Omit<UserEntity, 'password'>> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    // Check if user exists and has access
    await this.findOne(id, companyId);

    await this.userRepository.update({ id, companyId }, data);

    // Return updated user without password
    return this.findOne(id, companyId);
  }

  async remove(id: string, companyId: string): Promise<void> {
    await this.findOne(id, companyId);

    await this.userRepository.softDelete({ id, companyId });
  }
}
