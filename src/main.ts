import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { globalValidationPipe } from './common/validationPipe';
import morgan from 'morgan';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Use Morgan for HTTP request logging
  app.use(morgan('dev'));

  // Use global validation pipe
  app.useGlobalPipes(globalValidationPipe);

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Cort API')
    .setDescription('Cort Backend API Documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .addTag('Authentication', 'User authentication and authorization')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT;
  await app.listen(port);
  console.log(`🚀 Server is running on port ${port}`);
  console.log(
    `📘 Swagger Docs available at: http://localhost:${port}/api/docs`,
  );
}

bootstrap();
