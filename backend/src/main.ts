import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix("api/v1");

  const port = configService.get<number>("PORT") || 3000;
  await app.listen(port);

  console.log(`🚀 Backend NestJS démarré sur le port ${port}`);
  console.log(`📊 Environment: ${configService.get<string>("NODE_ENV")}`);
  console.log(`🔗 Supabase URL: ${configService.get<string>("SUPABASE_URL")}`);
}

bootstrap();
