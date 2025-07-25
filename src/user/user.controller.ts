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
  Request,
  UsePipes,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserEntity } from './user.entity';
import { UserSchema } from './user.static';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from './user.entity';
import { HttpCode } from '@nestjs/common/decorators/http/http-code.decorator';
import { JwtServiceCustom } from '../auth/jwt.service';
import { Public } from '../auth/public.decorator';
import { ZodValidationPipe } from '../zod.validation.pipe';

function toUserRole(role: unknown): UserRole | undefined {
  if (
    typeof role === 'string' &&
    (role === 'OWNER' || role === 'OPERATOR' || role === 'VIEWER')
  ) {
    return UserRole[role];
  }
  return undefined;
}

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtServiceCustom: JwtServiceCustom,
  ) {}

  @Post('register')
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(UserSchema))
  async register(
    @Body() data: Partial<UserEntity>,
  ): Promise<Omit<UserEntity, 'password'>> {
    const userData: Partial<UserEntity> = {
      ...data,
      role: data.role ? UserRole[data.role] : undefined,
    };
    // Use JwtServiceCustom for registration
    return this.jwtServiceCustom.register(userData);
  }
  @Public()
  @Post('public-register')
  @HttpCode(201)
  async publicRegister(
    @Body() data: Partial<UserEntity> & { companyName: string },
  ): Promise<Omit<UserEntity, 'password'>> {
    const { companyName, ...userData } = data;
    if (!companyName) {
      throw new BadRequestException('companyName is required');
    }
    // Omit companyId from validation for public register
    const result = UserSchema.omit({ companyId: true }).safeParse(userData);
    if (!result.success) {
      throw new BadRequestException(result.error);
    }
    const safeUserData: Partial<UserEntity> = {
      ...result.data,
      role: toUserRole(result.data.role),
    };

    return this.jwtServiceCustom.publicRegister(safeUserData, companyName);
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  @UsePipes(
    new ZodValidationPipe(UserSchema.pick({ email: true, password: true })),
  )
  async login(
    @Body() body: { email: string; password: string },
  ): Promise<{ accessToken: string }> {
    return this.jwtServiceCustom.login(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Post('add-to-company')
  @HttpCode(201)
  async addUserToCompany(
    @Body() data: Partial<UserEntity>,
    @Request() req: { user: UserEntity },
  ): Promise<Omit<UserEntity, 'password'>> {
    const result = UserSchema.omit({ companyId: true }).safeParse(data);
    if (!result.success) {
      throw new BadRequestException(result.error);
    }
    const userData: Partial<UserEntity> = {
      ...result.data,
      role: toUserRole(result.data.role),
    };
    const ownerUser = req.user;
    return this.jwtServiceCustom.registerUserToCompany(userData, ownerUser);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  @Get()
  findAll(@Request() req: { user: UserEntity }): Promise<UserEntity[]> {
    return this.userService.findAll(req.user.companyId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.OPERATOR, UserRole.VIEWER)
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Request() req: { user: UserEntity },
  ): Promise<UserEntity> {
    return this.userService.findOne(id, req.user.companyId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: Partial<UserEntity>,
    @Request() req: { user: UserEntity },
  ): Promise<UserEntity> {
    const result = UserSchema.partial().safeParse(data);
    if (!result.success) {
      throw new BadRequestException(result.error);
    }
    const userData: Partial<UserEntity> = {
      ...result.data,
      role: result.data.role ? UserRole[result.data.role] : undefined,
    };
    return this.userService.update(id, userData, req.user.companyId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Delete(':id')
  @HttpCode(204)
  remove(
    @Param('id') id: string,
    @Request() req: { user: UserEntity },
  ): Promise<void> {
    return this.userService.remove(id, req.user.companyId);
  }
}
