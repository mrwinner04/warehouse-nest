import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  BadRequestException,
  Request,
  UsePipes,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserEntity } from './user.entity';
import { UserSchema } from './user.static';
import { Roles } from '../decorator/roles.decorator';
import { UserRole } from './user.entity';
import { HttpCode } from '@nestjs/common/decorators/http/http-code.decorator';
import { JwtServiceCustom } from '../auth/jwt.service';
import { Public } from '../decorator/public.decorator';
import { ZodValidationPipe } from '../zod.validation.pipe';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import {
  CreateUserDto,
  PublicRegisterDto,
  LoginDto,
  UpdateUserDto,
  AddUserToCompanyDto,
  LoginResponseDto,
  UserResponseDto,
} from './dto/user.dto';
import { IdParamDto } from '../common/dto/base.dto';

function toUserRole(role: unknown): UserRole | undefined {
  if (
    typeof role === 'string' &&
    (role === 'OWNER' || role === 'OPERATOR' || role === 'VIEWER')
  ) {
    return UserRole[role];
  }
  return undefined;
}

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtServiceCustom: JwtServiceCustom,
  ) {}

  @Post('register')
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(UserSchema))
  @ApiOperation({ summary: 'Register a new user (requires authentication)' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async register(
    @Body() data: CreateUserDto,
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
  @ApiOperation({
    summary: 'Register a new user and company (public endpoint)',
  })
  @ApiResponse({
    status: 201,
    description: 'User and company created successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async publicRegister(
    @Body() data: PublicRegisterDto,
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
  @ApiOperation({ summary: 'Login user (public endpoint)' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid credentials',
  })
  async login(@Body() body: LoginDto): Promise<{ accessToken: string }> {
    return this.jwtServiceCustom.login(body.email, body.password);
  }

  @Roles(UserRole.OWNER)
  @Post('add-to-company')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Add a new user to the current company (OWNER only)',
  })
  @ApiResponse({
    status: 201,
    description: 'User added to company successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async addUserToCompany(
    @Body() data: AddUserToCompanyDto,
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

  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  @Get()
  @ApiOperation({ summary: 'Get all users in the current company' })
  @ApiResponse({
    status: 200,
    description: 'List of users retrieved successfully',
    type: [UserResponseDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  findAll(
    @Request() req: { user: UserEntity },
  ): Promise<Omit<UserEntity, 'password'>[]> {
    return this.userService.findAll(req.user.companyId);
  }

  @Roles(UserRole.OWNER, UserRole.OPERATOR, UserRole.VIEWER)
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  findOne(
    @Param() params: IdParamDto,
    @Request() req: { user: UserEntity },
  ): Promise<Omit<UserEntity, 'password'>> {
    return this.userService.findOne(params.id, req.user.companyId);
  }

  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  @Put(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async update(
    @Param() params: IdParamDto,
    @Body() data: UpdateUserDto,
    @Request() req: { user: UserEntity },
  ): Promise<Omit<UserEntity, 'password'>> {
    const result = UserSchema.partial().safeParse(data);
    if (!result.success) {
      throw new BadRequestException(result.error);
    }
    const userData: Partial<UserEntity> = {
      ...result.data,
      role: result.data.role ? UserRole[result.data.role] : undefined,
    };
    return this.userService.update(params.id, userData, req.user.companyId);
  }

  @Roles(UserRole.OWNER)
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a user (OWNER only)' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  remove(
    @Param() params: IdParamDto,
    @Request() req: { user: UserEntity },
  ): Promise<void> {
    return this.userService.remove(params.id, req.user.companyId);
  }
}
