/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { SERVICE_PORTS } from '@puchi-be/shared';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Quiz Service');

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

  const port = process.env.PORT || SERVICE_PORTS.QUIZ_SERVICE;
  await app.listen(port);
  logger.log(`🚀 Quiz Service is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
