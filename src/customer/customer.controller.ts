import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Request,
  Query,
  UsePipes,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerEntity } from './customer.entity';
import { CustomerSchema } from './customer.zod';
import { HttpCode } from '@nestjs/common/decorators/http/http-code.decorator';
import { Roles } from '../decorator/roles.decorator';
import { UserRole } from '../user/user.entity';
import { ZodValidationPipe } from '../zod.validation.pipe';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Customers')
@ApiBearerAuth('access-token')
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(CustomerSchema))
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({
    status: 201,
    description: 'Customer created successfully',
    type: CustomerEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async create(
    @Body() data: Partial<CustomerEntity>,
    @Request() req: { user: { companyId: string } },
  ): Promise<CustomerEntity> {
    const customerData = { ...data, companyId: req.user.companyId };
    return this.customerService.create(customerData);
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: String,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: String,
    description: 'Items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'Customers retrieved successfully',
    type: [CustomerEntity],
  })
  findAll(
    @Request() req: { user: { companyId: string } },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.customerService.findAll(req.user.companyId, pageNum, limitNum);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific customer by ID' })
  @ApiParam({ name: 'id', description: 'Customer ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Customer retrieved successfully',
    type: CustomerEntity,
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  findOne(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string } },
  ): Promise<CustomerEntity> {
    return this.customerService.findOne(id, req.user.companyId);
  }

  @Put(':id')
  @UsePipes(new ZodValidationPipe(CustomerSchema.partial()))
  @ApiOperation({ summary: 'Update a customer' })
  @ApiParam({ name: 'id', description: 'Customer ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Customer updated successfully',
    type: CustomerEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<CustomerEntity>,
    @Request() req: { user: { companyId: string } },
  ): Promise<CustomerEntity> {
    const customerData = { ...data, companyId: req.user.companyId };
    return this.customerService.update(id, customerData, req.user.companyId);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Soft delete a customer' })
  @ApiParam({ name: 'id', description: 'Customer ID', type: 'string' })
  @ApiResponse({ status: 204, description: 'Customer deleted successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  remove(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string } },
  ): Promise<void> {
    return this.customerService.remove(id, req.user.companyId);
  }

  @Roles(UserRole.OWNER)
  @Delete(':id/hard')
  @HttpCode(204)
  @ApiOperation({ summary: 'Hard delete a customer (OWNER only)' })
  @ApiParam({ name: 'id', description: 'Customer ID', type: 'string' })
  @ApiResponse({ status: 204, description: 'Customer permanently deleted' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  hardRemove(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string } },
  ): Promise<void> {
    return this.customerService.hardRemove(id, req.user.companyId);
  }
}
