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

  // Updated to throw proper errors instead of returning null
  async findOne(id: string, companyId: string): Promise<UserEntity> {
    return validateCompanyAccess(
      () => this.userRepository.findOneBy({ id }),
      companyId,
      'User',
    );
  }

  // Updated to throw proper errors instead of returning null
  async update(
    id: string,
    data: Partial<UserEntity>,
    companyId: string,
  ): Promise<UserEntity> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    // First validate access
    await this.findOne(id, companyId);

    // Update the entity
    await this.userRepository.update({ id, companyId }, data);

    // Return the updated entity
    return this.findOne(id, companyId);
  }

  // Updated to throw proper errors
  async remove(id: string, companyId: string): Promise<void> {
    // First validate access
    await this.findOne(id, companyId);

    await this.userRepository.softDelete({ id, companyId });
  }
}
