import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity, UserRole } from '../user/user.entity';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { CompanyService } from '../company/company.service';

@Injectable()
export class JwtServiceCustom {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly companyService: CompanyService,
  ) {}

  async register(
    data: Partial<UserEntity>,
  ): Promise<Omit<UserEntity, 'password'>> {
    if (!data.password) {
      throw new BadRequestException('Password is required.');
    }
    if (!data.email) {
      throw new BadRequestException('Email is required.');
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = this.userRepository.create({
      ...data,
      password: hashedPassword,
      role: data.role ?? UserRole.VIEWER,
    });
    const saved = await this.userRepository.save(user);
    const reloaded = await this.userRepository.findOneBy({ id: saved.id });
    if (!reloaded)
      throw new BadRequestException('Registration failed. User not found.');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = reloaded;
    return userWithoutPassword;
  }

  async publicRegister(
    userData: Partial<UserEntity>,
    companyName: string,
  ): Promise<Omit<UserEntity, 'password'>> {
    const company = await this.companyService.create({ name: companyName });
    const ownerData: Partial<UserEntity> = {
      ...userData,
      companyId: company.id,
      role: UserRole.OWNER,
    };
    if (ownerData.role && typeof ownerData.role === 'string') {
      ownerData.role = UserRole[ownerData.role as keyof typeof UserRole];
    }
    return this.register(ownerData);
  }

  async registerUserToCompany(
    newUserData: Partial<UserEntity>,
    ownerUser: UserEntity,
  ): Promise<Omit<UserEntity, 'password'>> {
    if (
      !newUserData.role ||
      !['OPERATOR', 'VIEWER'].includes(newUserData.role as string)
    ) {
      throw new BadRequestException('Role must be either OPERATOR or VIEWER.');
    }
    let roleValue = newUserData.role;
    if (roleValue && typeof roleValue === 'string') {
      roleValue = UserRole[roleValue as keyof typeof UserRole];
    }
    const userData: Partial<UserEntity> = {
      ...newUserData,
      companyId: ownerUser.companyId,
      role: roleValue,
    };
    return this.register(userData);
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string }> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid email or password.');
    }
    const payload = {
      sub: user.id,
      role: user.role,
      email: user.email,
      companyId: user.companyId, // Added for multi-tenancy
    };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
