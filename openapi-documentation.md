# Documentation OpenAPI/Swagger pour l'API Xeption E-commerce

## Sommaire
1. [Introduction](#introduction)
2. [Configuration de Swagger dans NestJS](#configuration-de-swagger-dans-nestjs)
3. [Accès à la Documentation Swagger](#accès-à-la-documentation-swagger)
4. [Documenter les Endpoints](#documenter-les-endpoints)
5. [Documenter les DTOs](#documenter-les-dtos)
6. [Authentification dans Swagger](#authentification-dans-swagger)
7. [Génération des Fichiers OpenAPI](#génération-des-fichiers-openapi)
8. [Utilisation avec des Outils Externes](#utilisation-avec-des-outils-externes)

## Introduction

OpenAPI (anciennement Swagger) est une spécification pour les APIs RESTful qui permet de documenter de manière standardisée les endpoints, les modèles de données, les paramètres, les réponses, et les méthodes d'authentification d'une API. Cette documentation est essentielle pour:

- Faciliter la compréhension de l'API par les développeurs frontend
- Automatiser la génération de clients API
- Tester les endpoints de manière interactive
- Maintenir une documentation à jour avec le code

## Configuration de Swagger dans NestJS

### Installation des Dépendances

Pour implémenter Swagger dans l'API Xeption E-commerce, il faut installer les packages nécessaires:

```bash
npm install @nestjs/swagger swagger-ui-express
```

### Configuration dans le Projet

La configuration de Swagger doit être ajoutée dans le fichier `main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
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
  SwaggerModule.setup('api-docs', app, document);
  
  // Autres configurations
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors();
  
  await app.listen(3000);
}
bootstrap();
```

## Accès à la Documentation Swagger

Une fois configurée, la documentation Swagger est accessible à l'URL:

```
http://localhost:3000/api-docs
```

Cette interface permet de:
- Visualiser tous les endpoints disponibles
- Tester les endpoints directement depuis l'interface
- Consulter les schémas de données (DTOs)
- S'authentifier pour tester les endpoints protégés

## Documenter les Endpoints

Pour documenter efficacement les endpoints, utilisez les décorateurs Swagger dans les contrôleurs:

### Exemple: MarketingController

```typescript
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiBody 
} from '@nestjs/swagger';
import { AuthGuard } from '../../common/auth/auth.guard';
import { Roles } from '../../common/auth/roles.decorator';
import { UserRole } from '../../domain/users/user.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { BannerResponseDto } from './dto/banner-response.dto';

@ApiTags('marketing')
@Controller('marketing')
export class MarketingController {
  constructor(
    private readonly createBannerUseCase: CreateBannerUseCase,
    private readonly getBannersUseCase: GetBannersUseCase,
  ) {}

  @Post('banners')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer une nouvelle bannière marketing' })
  @ApiBody({ type: CreateBannerDto })
  @ApiResponse({ 
    status: 201, 
    description: 'La bannière a été créée avec succès',
    type: BannerResponseDto 
  })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 403, description: 'Accès interdit' })
  async createBanner(
    @Body() createBannerDto: CreateBannerDto,
  ): Promise<BannerResponseDto> {
    const banner = await this.createBannerUseCase.execute(createBannerDto);
    return this.mapToResponse(banner);
  }
  
  @Get('banners')
  @ApiOperation({ summary: 'Récupérer toutes les bannières actives' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des bannières actives',
    type: [BannerResponseDto]
  })
  async getBanners(): Promise<BannerResponseDto[]> {
    const banners = await this.getBannersUseCase.execute();
    return banners.map(banner => this.mapToResponse(banner));
  }
  
  // Autres méthodes...
}
```

### Décorateurs Swagger Principaux

| Décorateur | Description |
|------------|-------------|
| `@ApiTags()` | Catégorise les endpoints par groupe |
| `@ApiOperation()` | Décrit l'opération (endpoint) |
| `@ApiResponse()` | Documente les réponses possibles |
| `@ApiBody()` | Spécifie le type du corps de la requête |
| `@ApiParam()` | Documente les paramètres de route |
| `@ApiQuery()` | Documente les paramètres de requête |
| `@ApiBearerAuth()` | Indique que l'endpoint nécessite un token Bearer |
| `@ApiHeader()` | Documente les en-têtes nécessaires |

## Documenter les DTOs

Les DTOs (Data Transfer Objects) doivent être décorés avec les décorateurs Swagger pour générer automatiquement les schémas:

### Exemple: CreateBannerDto

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class CreateBannerDto {
  @ApiProperty({
    description: 'Titre de la bannière',
    example: 'Promotion de printemps'
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'URL de l\'image de la bannière',
    example: 'https://xeption.com/images/banners/spring-promo.jpg'
  })
  @IsUrl()
  imageUrl: string;

  @ApiProperty({
    description: 'URL de destination quand on clique sur la bannière',
    example: 'https://xeption.com/promotions/spring',
    required: false
  })
  @IsUrl()
  @IsOptional()
  linkUrl?: string;

  @ApiProperty({
    description: 'Date de début d\'affichage',
    example: '2025-07-01T00:00:00Z',
    required: false
  })
  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @ApiProperty({
    description: 'Date de fin d\'affichage',
    example: '2025-07-31T23:59:59Z',
    required: false
  })
  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @ApiProperty({
    description: 'Indique si la bannière est active',
    example: true,
    default: true,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
```

### Décorateurs pour les DTOs

| Décorateur | Description |
|------------|-------------|
| `@ApiProperty()` | Documente une propriété du DTO |
| `@ApiPropertyOptional()` | Documente une propriété optionnelle |
| `@ApiHideProperty()` | Masque une propriété dans la documentation |
| `@ApiExtraModels()` | Déclare des modèles supplémentaires |

## Authentification dans Swagger

Pour permettre aux utilisateurs de tester les endpoints sécurisés directement depuis l'interface Swagger:

1. Ajoutez l'authentification Bearer dans la configuration:

```typescript
const config = new DocumentBuilder()
  // Autres configurations...
  .addBearerAuth()
  .build();
```

2. Annotez les endpoints protégés:

```typescript
@UseGuards(AuthGuard)
@ApiBearerAuth()
@Post('some-protected-endpoint')
async someProtectedMethod() {
  // ...
}
```

3. Dans l'interface Swagger, l'utilisateur pourra cliquer sur le bouton "Authorize" et saisir son token JWT.

## Génération des Fichiers OpenAPI

Pour générer un fichier statique de la spécification OpenAPI (utile pour les outils externes):

```typescript
import * as fs from 'fs';
import { resolve } from 'path';

// Dans la fonction bootstrap() après avoir créé le document
const document = SwaggerModule.createDocument(app, config);

// Générer le fichier JSON
fs.writeFileSync(
  resolve(process.cwd(), 'openapi-spec.json'),
  JSON.stringify(document, null, 2),
);

// Générer le fichier YAML (nécessite js-yaml)
// import * as yaml from 'js-yaml';
// fs.writeFileSync(
//   resolve(process.cwd(), 'openapi-spec.yaml'),
//   yaml.dump(document),
// );

SwaggerModule.setup('api-docs', app, document);
```

## Utilisation avec des Outils Externes

La documentation OpenAPI générée peut être utilisée avec plusieurs outils:

### Génération de Clients API

Utilisez des outils comme OpenAPI Generator pour générer automatiquement des clients API:

```bash
# Installation de l'outil
npm install @openapitools/openapi-generator-cli -g

# Génération d'un client TypeScript-Axios
openapi-generator-cli generate -i openapi-spec.json -g typescript-axios -o ./client-sdk
```

### Outils de Documentation

Importez le fichier OpenAPI dans des outils comme:
- Redoc pour une documentation plus riche visuellement
- Stoplight Studio pour éditer et visualiser la documentation
- Postman pour importer l'ensemble des endpoints

### Intégration CI/CD

Validez la spécification OpenAPI dans votre pipeline CI/CD:

```bash
# Installation de l'outil de validation
npm install -g @apidevtools/swagger-cli

# Validation du fichier
swagger-cli validate openapi-spec.json
```

## Conclusion

La documentation OpenAPI/Swagger est un outil essentiel pour maintenir une API bien documentée et facilement utilisable. Elle offre:

- Une interface interactive pour tester l'API
- Une documentation automatiquement synchronisée avec le code
- Un standard reconnu dans l'industrie
- Des possibilités d'intégration avec de nombreux outils

Pour l'API Xeption E-commerce, cette documentation servira de référence pour les développeurs frontend et les partenaires externes qui souhaitent intégrer la plateforme.