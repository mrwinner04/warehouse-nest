import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // // Swagger setup
  // const config = new DocumentBuilder()
  //   .setTitle('Warehouse SaaS API')
  //   .setDescription(
  //     'API documentation for the multi-tenant warehouse management SaaS',
  //   )
  //   .setVersion('1.0')
  //   .addBearerAuth()
  //   .build();
  // const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
