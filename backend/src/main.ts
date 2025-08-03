import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as compression from "compression";
import helmet from "helmet";
// import { CacheInterceptor } from "@nestjs/cache-manager";
import { rateLimit } from "express-rate-limit";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const isProduction = configService.get<string>("NODE_ENV") === "production";

  // Configuration CORS sécurisée
  app.enableCors({
    origin: [
      'https://xeptionetwork.shop',           // Site principal
      'https://staging.xeptionetwork.shop',   // Environnement de staging
      /^https:\/\/[a-z0-9-]+\.xeptionetwork\.shop$/,  // Sous-domaines
      !isProduction ? 'http://localhost:5173' : false // Dev uniquement
    ].filter(Boolean),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400, // 24 heures
  });

  // Activer la compression pour améliorer les performances
  app.use(compression());

  // Sécurité avec Helmet
  app.use(helmet());

  // Protection contre les abus (rate limiting)
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: isProduction ? 100 : 1000, // Limite plus stricte en production
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // Mise en cache gérée au niveau des contrôleurs individuels

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

  // Configuration de Swagger
  const config = new DocumentBuilder()
    .setTitle('Xeption E-commerce API')
    .setDescription('API pour la plateforme e-commerce Xeption')
    .setVersion('1.0')
    .addTag('auth', 'Authentification et gestion des utilisateurs')
    .addTag('catalog', 'Gestion du catalogue de produits')
    .addTag('cartorder', 'Gestion des paniers et commandes')
    .addTag('marketing', 'Gestion des bannières et promotions')
    .addTag('rfq', 'Demandes de devis')
    .addTag('tradein', 'Service de reprise d\'appareils')
    .addTag('backorder', 'Gestion des commandes en attente')
    .addTag('delivery', 'Gestion des livraisons')
    .addTag('advisory', 'Services de conseil')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  
  // Mise en place de l'interface Swagger (accessible via /api-docs)
  SwaggerModule.setup('api-docs', app, document);
  
  // Optionnel : génération du fichier JSON pour les outils externes
  // si nécessaire, décommentez et installez fs
  // import * as fs from 'fs';
  // import { resolve } from 'path';
  // fs.writeFileSync(
  //   resolve(process.cwd(), 'openapi-spec.json'),
  //   JSON.stringify(document, null, 2),
  // );

  const port = configService.get<number>("PORT") || 3000;
  await app.listen(port);

  console.log(`🚀 Backend NestJS démarré sur le port ${port}`);
  console.log(`📊 Environment: ${configService.get<string>("NODE_ENV")}`);
  console.log(`🔗 Supabase URL: ${configService.get<string>("SUPABASE_URL")}`);
  console.log(`📚 Documentation API: http://localhost:${port}/api-docs`);
}

bootstrap();
