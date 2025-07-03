/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { CustomExceptionFilter } from './custom-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('API Gateway');

  app.useGlobalFilters(new CustomExceptionFilter());

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  });

  // Add logging middleware
  app.use((req, res, next) => {
    const start = Date.now();
    logger.log(`${req.method} ${req.url} - ${req.ip} - User-Agent: ${req.get('User-Agent')}`);

    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.log(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
    });

    next();
  });

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle('API Gateway')
    .setDescription('REST API Gateway for microservices')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 9000;
  await app.listen(port);
  logger.log(`🚀 API Gateway is running on: http://localhost:${port}/${globalPrefix}`);
  logger.log(`📚 Swagger docs available at: http://localhost:${port}/api-docs`);
}

bootstrap();
