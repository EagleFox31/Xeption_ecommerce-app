# Sécurité et Performance de l'API Xeption E-commerce

## Sommaire
1. [Introduction](#introduction)
2. [Audit de Sécurité des Endpoints](#audit-de-sécurité-des-endpoints)
3. [Optimisation des Requêtes Prisma/PostgreSQL](#optimisation-des-requêtes-prismapostgresql)
4. [Mise en Place du Rate Limiting](#mise-en-place-du-rate-limiting)
5. [Configuration des Logs Structurés](#configuration-des-logs-structurés)
6. [Bonnes Pratiques et Recommandations](#bonnes-pratiques-et-recommandations)

## Introduction

La sécurité et la performance sont des aspects critiques pour toute application e-commerce. Ce document présente les stratégies mises en œuvre dans l'API Xeption E-commerce pour garantir un niveau élevé de sécurité tout en maintenant des performances optimales.

## Audit de Sécurité des Endpoints

### Méthodologie d'Audit

L'audit de sécurité des endpoints de l'API Xeption E-commerce suit une approche systématique:

1. **Identification des endpoints sensibles**: Catégorisation des endpoints selon leur niveau de risque
2. **Analyse des vecteurs d'attaque**: Identification des vulnérabilités potentielles
3. **Tests de pénétration**: Simulation d'attaques pour tester la résistance
4. **Recommandations**: Mesures correctives à appliquer

### Vulnérabilités Courantes et Mesures de Protection

#### 1. Injection SQL

**Risque**: Les attaquants peuvent injecter du code SQL malveillant via les paramètres de requête.

**Protection implémentée**:
- Utilisation de Prisma ORM qui fournit une protection contre les injections SQL
- Validation des entrées avec class-validator
- Paramétrage systématique des requêtes

```typescript
// Exemple d'utilisation sécurisée avec Prisma
async findUserByEmail(email: string): Promise<User | null> {
  // Prisma utilise des requêtes paramétrées, protégeant contre les injections SQL
  const user = await this.prisma.user.findUnique({
    where: { email },
  });
  
  return user ? this.mapToEntity(user) : null;
}
```

#### 2. Authentification et Autorisation

**Risque**: Accès non autorisé aux ressources protégées.

**Protection implémentée**:
- Utilisation de JWT avec signature et expiration
- Garde d'authentification global (`AuthGuard`)
- Décorateur de rôles pour l'autorisation basée sur les rôles
- Validation du propriétaire des ressources

```typescript
// Exemple de protection d'endpoint avec authentification et autorisation
@Controller('marketing')
export class MarketingController {
  @Post('banners')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  async createBanner(@Body() createBannerDto: CreateBannerDto): Promise<BannerResponse> {
    // Seuls les administrateurs authentifiés peuvent créer des bannières
  }
}
```

#### 3. Cross-Site Request Forgery (CSRF)

**Risque**: Exécution d'actions non autorisées au nom de l'utilisateur authentifié.

**Protection implémentée**:
- Utilisation de tokens CSRF pour les opérations sensibles
- Implémentation du middleware csurf

```typescript
// Configuration du middleware CSRF dans main.ts
import * as csurf from 'csurf';

// ...

app.use(
  csurf({
    cookie: {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    },
  }),
);
```

#### 4. Cross-Site Scripting (XSS)

**Risque**: Injection de scripts malveillants exécutés dans le navigateur.

**Protection implémentée**:
- Utilisation de helmet pour définir les en-têtes de sécurité
- Échappement des données dans les réponses API
- Content Security Policy (CSP)

```typescript
// Configuration de helmet dans main.ts
import * as helmet from 'helmet';

// ...

app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://trusted-cdn.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://trusted-cdn.com'],
      imgSrc: ["'self'", 'data:', 'https://trusted-cdn.com'],
      connectSrc: ["'self'", 'https://api.xeption.com'],
    },
  }),
);
```

#### 5. Exposition d'Informations Sensibles

**Risque**: Divulgation d'informations sensibles via les réponses API.

**Protection implémentée**:
- Filtrage des données sensibles avant envoi
- Utilisation de DTOs de réponse spécifiques
- Journalisation sécurisée (sans données sensibles)

```typescript
// Exemple de transformation des données avant envoi
private mapToResponse(user: User): UserResponseDto {
  const { password, resetToken, ...userResponse } = user;
  return userResponse;
}
```

### Checklist de Sécurité des Endpoints

Pour chaque endpoint, les contrôles suivants sont effectués:

- ✅ Authentification appropriée
- ✅ Autorisation basée sur les rôles
- ✅ Validation des entrées
- ✅ Sanitization des sorties
- ✅ Protection contre les injections
- ✅ Limitation de débit (rate limiting)
- ✅ Journalisation des accès et erreurs
- ✅ Gestion sécurisée des erreurs

## Optimisation des Requêtes Prisma/PostgreSQL

### Stratégies d'Optimisation

#### 1. Sélection des Champs

Limitez les champs retournés pour réduire la charge réseau et le temps de traitement:

```typescript
// Avant optimisation
const users = await prisma.user.findMany();

// Après optimisation - sélection uniquement des champs nécessaires
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    // Seuls les champs nécessaires sont sélectionnés
  },
});
```

#### 2. Utilisation des Relations Judicieuse

Chargement conditionnel des relations pour éviter les requêtes N+1:

```typescript
// Mauvaise pratique - problème N+1
const orders = await prisma.order.findMany();
for (const order of orders) {
  const items = await prisma.orderItem.findMany({
    where: { orderId: order.id },
  });
  // Traitement des items...
}

// Bonne pratique - chargement des relations en une seule requête
const orders = await prisma.order.findMany({
  include: {
    items: true,
  },
});
```

#### 3. Pagination

Implémentation de la pagination pour limiter le volume de données:

```typescript
// Implémentation de la pagination
async getProducts(page = 1, limit = 10): Promise<ProductsResponse> {
  const skip = (page - 1) * limit;
  
  const [items, total] = await Promise.all([
    this.prisma.product.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    this.prisma.product.count(),
  ]);
  
  return {
    items: items.map(this.mapToEntity),
    total,
    page,
    limit,
  };
}
```

#### 4. Indexation Appropriée

Création d'index pour les colonnes fréquemment utilisées dans les requêtes:

```prisma
// Dans le schéma Prisma
model Product {
  id          String    @id @default(uuid())
  name        String
  price       Decimal
  categoryId  String
  category    Category  @relation(fields: [categoryId], references: [id])
  
  // Index pour améliorer les recherches par catégorie
  @@index([categoryId])
  // Index pour les recherches de produits par nom
  @@index([name])
}
```

#### 5. Requêtes en Lot (Batch Queries)

Utilisation des opérations en lot pour réduire le nombre de requêtes:

```typescript
// Au lieu de plusieurs requêtes individuelles
const createItems = async (items: CartItem[]): Promise<void> => {
  // Utilisation de createMany pour insérer plusieurs éléments en une seule requête
  await this.prisma.cartItem.createMany({
    data: items.map(item => ({
      cartId: item.cartId,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
  });
};
```

#### 6. Utilisation des Transactions

Garantir l'intégrité des données avec les transactions:

```typescript
// Exemple de transaction pour créer une commande à partir d'un panier
async createOrderFromCart(params: CreateOrderParams): Promise<Order> {
  return this.prisma.$transaction(async (tx) => {
    // 1. Créer la commande
    const order = await tx.order.create({
      data: {
        userId: params.userId,
        status: OrderStatus.PENDING,
        // Autres données...
      },
    });
    
    // 2. Récupérer les éléments du panier
    const cartItems = await tx.cartItem.findMany({
      where: { cartId: params.cartId },
    });
    
    // 3. Créer les éléments de commande
    await tx.orderItem.createMany({
      data: cartItems.map(item => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    });
    
    // 4. Marquer le panier comme converti
    await tx.cart.update({
      where: { id: params.cartId },
      data: { status: CartStatus.CONVERTED },
    });
    
    return this.mapOrderToEntity(order);
  });
}
```

### Optimisation des Requêtes Complexes

Pour les requêtes complexes, considérez ces approches:

1. **Utilisation de requêtes brutes SQL** pour les cas spécifiques:

```typescript
// Pour des requêtes complexes, utiliser prisma.$queryRaw
const salesByCategory = await this.prisma.$queryRaw`
  SELECT 
    c.name as category_name, 
    SUM(oi.quantity * oi.unit_price) as total_sales
  FROM order_items oi
  JOIN products p ON oi.product_id = p.id
  JOIN categories c ON p.category_id = c.id
  JOIN orders o ON oi.order_id = o.id
  WHERE o.status = 'COMPLETED'
  AND o.created_at BETWEEN ${startDate} AND ${endDate}
  GROUP BY c.name
  ORDER BY total_sales DESC
`;
```

2. **Mise en cache des requêtes fréquentes**:

```typescript
// Exemple avec Redis pour la mise en cache
async getActivePromotions(): Promise<Promotion[]> {
  const cacheKey = 'active_promotions';
  
  // Vérifier si les données sont en cache
  const cachedData = await this.redisService.get(cacheKey);
  if (cachedData) {
    return JSON.parse(cachedData);
  }
  
  // Si non, exécuter la requête
  const promotions = await this.prisma.promotion.findMany({
    where: {
      isActive: true,
      startDate: { lte: new Date() },
      endDate: { gte: new Date() },
    },
  });
  
  // Mettre en cache pour 15 minutes
  await this.redisService.set(cacheKey, JSON.stringify(promotions), 900);
  
  return promotions;
}
```

## Mise en Place du Rate Limiting

Le rate limiting (limitation de débit) est essentiel pour protéger l'API contre les abus et les attaques par déni de service (DoS).

### Configuration avec NestJS Throttler

```typescript
// app.module.ts
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    // Configuration globale du throttler
    ThrottlerModule.forRoot({
      ttl: 60, // Période en secondes
      limit: 60, // Nombre maximum de requêtes par période
    }),
    // Autres modules...
  ],
  providers: [
    // Application globale du rate limiting
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

### Configuration Avancée par Routes

```typescript
// Différentes limites selon les routes
@Controller('auth')
export class AuthController {
  // Limiter les tentatives de connexion pour prévenir les attaques par force brute
  @Throttle(5, 60) // 5 requêtes par minute
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthTokenResponse> {
    // Logique de connexion...
  }
  
  // Limiter les demandes de réinitialisation de mot de passe
  @Throttle(3, 300) // 3 requêtes par 5 minutes
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    // Logique d'envoi d'email de réinitialisation...
  }
}
```

### Personnalisation avec des Stratégies de Stockage

```typescript
// Configuration avec Redis pour le stockage distribué
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        ttl: 60,
        limit: 60,
        storage: new ThrottlerStorageRedisService({
          host: process.env.REDIS_HOST,
          port: parseInt(process.env.REDIS_PORT),
          password: process.env.REDIS_PASSWORD,
          keyPrefix: 'throttler:',
        }),
      }),
    }),
    // Autres modules...
  ],
})
export class AppModule {}
```

### Exceptions au Rate Limiting

Pour certaines IP ou utilisateurs spécifiques:

```typescript
// Création d'un guard personnalisé
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async handleRequest(
    context: ExecutionContext,
    limit: number,
    ttl: number,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip;
    
    // Liste d'IPs ou de clients à exclure du rate limiting
    const excludedIps = ['127.0.0.1', '192.168.1.1'];
    if (excludedIps.includes(ip)) {
      return true;
    }
    
    // Vérification API key pour les partenaires
    const apiKey = request.headers['x-api-key'];
    if (apiKey && await this.isValidPartnerApiKey(apiKey)) {
      // Les partenaires ont des limites plus élevées
      return this.handlePartnerRequest(context, apiKey);
    }
    
    // Appliquer le rate limiting standard
    return super.handleRequest(context, limit, ttl);
  }
  
  // Autres méthodes d'aide...
}
```

## Configuration des Logs Structurés

Les logs structurés permettent une meilleure analyse et recherche des événements système. Voici comment ils sont configurés dans l'API Xeption E-commerce:

### Configuration avec Winston

```typescript
// logger.module.ts
import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        // Transport pour la console en développement
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
              return `${timestamp} [${context}] ${level}: ${message} ${
                Object.keys(meta).length ? JSON.stringify(meta) : ''
              }`;
            }),
          ),
        }),
        
        // Transport pour les fichiers de logs en production
        new winston.transports.DailyRotateFile({
          filename: 'logs/application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
          level: 'info',
        }),
        
        // Transport pour les erreurs
        new winston.transports.DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
          level: 'error',
        }),
      ],
    }),
  ],
  exports: [WinstonModule],
})
export class LoggerModule {}
```

### Service de Journalisation Personnalisé

```typescript
// custom-logger.service.ts
import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject } from '@nestjs/common';
import { Logger } from 'winston';
import { Request } from 'express';

@Injectable({ scope: Scope.TRANSIENT })
export class CustomLoggerService implements LoggerService {
  private context?: string;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  setContext(context: string) {
    this.context = context;
  }

  log(message: string, meta: Record<string, any> = {}) {
    this.logger.info(message, { context: this.context, ...meta });
  }

  error(message: string, trace?: string, meta: Record<string, any> = {}) {
    this.logger.error(message, { context: this.context, trace, ...meta });
  }

  warn(message: string, meta: Record<string, any> = {}) {
    this.logger.warn(message, { context: this.context, ...meta });
  }

  debug(message: string, meta: Record<string, any> = {}) {
    this.logger.debug(message, { context: this.context, ...meta });
  }

  // Méthode utilitaire pour journaliser les requêtes HTTP
  logHttpRequest(req: Request, userId?: string) {
    this.log('HTTP Request', {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userId,
      userAgent: req.headers['user-agent'],
    });
  }

  // Méthode pour journaliser les événements d'activité utilisateur
  logUserActivity(userId: string, action: string, resourceType: string, resourceId: string) {
    this.log('User Activity', {
      userId,
      action,
      resourceType,
      resourceId,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### Middleware de Journalisation HTTP

```typescript
// http-logger.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CustomLoggerService } from './custom-logger.service';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: CustomLoggerService) {
    this.logger.setContext('HTTP');
  }

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    
    // Extraire l'ID utilisateur si disponible
    const userId = req.user?.sub || 'anonymous';

    // Timestamp de début
    const start = Date.now();

    // Journaliser la requête entrante
    this.logger.log(`Incoming Request`, {
      method,
      url: originalUrl,
      ip,
      userAgent,
      userId,
    });

    // Une fois la réponse envoyée
    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length') || 0;
      const duration = Date.now() - start;

      // Journaliser la réponse
      const logMethod = statusCode >= 400 ? 'error' : 'log';
      this[logMethod](`Response Sent`, {
        method,
        url: originalUrl,
        statusCode,
        contentLength,
        duration: `${duration}ms`,
        userId,
      });
    });

    next();
  }
}
```

### Intégration dans le Module Principal

```typescript
// app.module.ts
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { LoggerModule } from './logger/logger.module';
import { HttpLoggerMiddleware } from './logger/http-logger.middleware';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './logger/logging.interceptor';

@Module({
  imports: [
    LoggerModule,
    // Autres modules...
  ],
  providers: [
    // Intercepteur global pour la journalisation
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Appliquer le middleware de journalisation à toutes les routes
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
```

### Intercepteur pour la Journalisation des Requêtes/Réponses

```typescript
// logging.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CustomLoggerService } from './custom-logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: CustomLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url } = req;
    const controllerName = context.getClass().name;
    const handlerName = context.getHandler().name;
    
    this.logger.setContext(`${controllerName}:${handlerName}`);

    const start = Date.now();
    return next.handle().pipe(
      tap({
        next: (val) => {
          const duration = Date.now() - start;
          this.logger.log(
            `${method} ${url} ${duration}ms`,
            {
              response: this.sanitizeResponse(val),
            },
          );
        },
        error: (err) => {
          const duration = Date.now() - start;
          this.logger.error(
            `${method} ${url} ${duration}ms`,
            err.stack,
            {
              error: {
                name: err.name,
                message: err.message,
                code: err.code,
              },
            },
          );
        },
      }),
    );
  }

  // Supprimer les données sensibles avant journalisation
  private sanitizeResponse(response: any): any {
    if (!response) return response;
    
    // Créer une copie pour ne pas modifier l'original
    const sanitized = { ...response };
    
    // Liste des champs sensibles à masquer
    const sensitiveFields = ['password', 'token', 'creditCard', 'secret'];
    
    // Parcourir récursivement et masquer les champs sensibles
    const sanitizeObject = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      
      Object.keys(obj).forEach(key => {
        if (sensitiveFields.includes(key)) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object') {
          sanitizeObject(obj[key]);
        }
      });
    };
    
    sanitizeObject(sanitized);
    return sanitized;
  }
}
```

## Bonnes Pratiques et Recommandations

### Sécurité

1. **Audit régulier**:
   - Réaliser des audits de sécurité tous les trimestres
   - Utiliser des outils automatisés comme OWASP ZAP
   - Engager des pentesteurs pour des tests approfondis annuels

2. **Mise à jour des dépendances**:
   - Utiliser `npm audit` régulièrement
   - Mettre en place des outils comme Dependabot
   - Planifier des cycles de mise à jour

3. **Authentification renforcée**:
   - Implémenter l'authentification à deux facteurs (2FA)
   - Utiliser des politiques de mots de passe robustes
   - Mettre en place des mécanismes de détection de tentatives suspectes

### Performance

1. **Surveillance des performances**:
   - Mettre en place une surveillance APM (Application Performance Monitoring)
   - Établir des baselines de performance
   - Configurer des alertes sur les déviations

2. **Optimisation des requêtes**:
   - Réviser régulièrement les requêtes les plus lentes
   - Optimiser les index de base de données
   - Envisager des stratégies de mise en cache

3. **Scalabilité**:
   - Concevoir l'application pour la scalabilité horizontale
   - Utiliser des queues pour les tâches intensives
   - Considérer l'architecture en microservices pour les modules à forte charge

### Maintenance

1. **Documentation**:
   - Maintenir une documentation à jour des endpoints
   - Documenter les choix d'architecture et les décisions techniques
   - Créer des guides pour les développeurs

2. **Tests automatisés**:
   - Maintenir une couverture de tests élevée
   - Automatiser les tests de régression
   - Implémenter des tests de charge

3. **Observabilité**:
   - Centraliser les logs avec un système comme ELK Stack
   - Mettre en place des dashboards de monitoring
   - Analyser les tendances pour anticiper les problèmes

En suivant ces recommandations, l'API Xeption E-commerce sera non seulement sécurisée et performante, mais aussi maintenable et évolutive sur le long terme.