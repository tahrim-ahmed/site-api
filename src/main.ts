import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('Pay-Site-api-bootstrap');

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('Pay-Site')
    .setDescription('The Pay-Site API description')
    .setVersion('1.0')
    .addTag('pay-site')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('pay-site-api', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT');

  app.enableCors();

  await app.listen(port);

  logger.log(
    `Documentation is running in http://localhost:${port}/pay-site-api`,
  );
  logger.log(`Api is running in http://localhost:${port}`);
}
bootstrap();
