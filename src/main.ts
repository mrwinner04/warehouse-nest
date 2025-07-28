import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CompanyAccessInterceptor } from './common/company-access.interceptor';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new CompanyAccessInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Warehouse SaaS API')
    .setDescription(
      'API documentation for the multi-tenant warehouse management SaaS. All endpoints require authentication except those marked as public.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token (without Bearer prefix)',
        in: 'header',
      },
      'access-token',
    )
    .addTag('Users', 'User management operations')
    .addTag('Products', 'Product management operations')
    .addTag('Customers', 'Customer management operations')
    .addTag('Warehouses', 'Warehouse management operations')
    .addTag('Orders', 'Order management operations')
    .addTag('Invoices', 'Invoice management operations')
    .addTag('Order Items', 'Order item management operations')
    .addTag('Companies', 'Company management operations')
    .addTag('Development', 'Development and testing endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
      tryItOutEnabled: true,
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
  console.error('Application failed to start:', err);
  process.exit(1);
});
