import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  // CORS 配置
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // API 前缀
  app.setGlobalPrefix('api/v1');

  // Swagger 文档
  const config = new DocumentBuilder()
    .setTitle('HomePlatform API')
    .setDescription('HomePlatform 智能家居平台 API 文档')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', '认证相关')
    .addTag('devices', '设备管理')
    .addTag('scenes', '场景管理')
    .addTag('automations', '自动化管理')
    .addTag('ai', 'AI 功能')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`
  🚀 HomePlatform API Server is running!

  📡 API:      http://localhost:${port}/api/v1
  📚 Docs:     http://localhost:${port}/api/docs
  🌍 ENV:      ${process.env.NODE_ENV || 'development'}
  `);
}

bootstrap();
