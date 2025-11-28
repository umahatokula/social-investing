import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  const config = new DocumentBuilder()
    .setTitle('Verified Social Investing Platform')
    .setDescription('The Verified Social Investing Platform API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  const env = process.env.NODE_ENV || 'development';
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  logger.log(`
  
  🚀 Verified Social Investing Platform API started successfully!

  Server:        http://localhost:${port}
  API Docs:      http://localhost:${port}/api
  Environment:   ${env}
  Database:      Configured
  Timezone:      ${timezone}
  
  `);
}
bootstrap();
