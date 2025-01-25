import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    allowedHeaders: '*',
    origin: '*',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('QueueEase API')
    .setDescription('The QueueEase API description')
    .setExternalDoc(
      'http://localhost:3000/api-json',
      'http://localhost:3000/api-json',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('QueueEase')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
