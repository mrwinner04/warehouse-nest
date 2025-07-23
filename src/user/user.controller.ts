import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserEntity } from './user.entity/user.entity';
import { UserSchema } from './user.zod';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from './user.entity/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(
    @Body() data: Partial<UserEntity>,
  ): Promise<Omit<UserEntity, 'password'>> {
    const result = UserSchema.safeParse(data);
    if (!result.success) {
      throw new BadRequestException(result.error);
    }
    const userData: Partial<UserEntity> = {
      ...result.data,
      role: result.data.role ? UserRole[result.data.role] : undefined,
    };
    return this.userService.register(userData);
  }

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
  ): Promise<{ accessToken: string }> {
    const result = UserSchema.pick({ email: true, password: true }).safeParse(
      body,
    );
    if (!result.success) {
      throw new BadRequestException(result.error);
    }
    return this.userService.login(result.data.email, result.data.password);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  @Get()
  findAll(): Promise<UserEntity[]> {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.OPERATOR, UserRole.VIEWER)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<UserEntity | null> {
    return this.userService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: Partial<UserEntity>,
  ): Promise<UserEntity | null> {
    const result = UserSchema.partial().safeParse(data);
    if (!result.success) {
      throw new BadRequestException(result.error);
    }
    const userData: Partial<UserEntity> = {
      ...result.data,
      role: result.data.role ? UserRole[result.data.role] : undefined,
    };
    return this.userService.update(id, userData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.userService.remove(id);
  }
}
