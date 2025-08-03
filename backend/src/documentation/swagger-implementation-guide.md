# Guide d'Implémentation Swagger pour l'API Xeption E-commerce

## Table des matières
1. [Introduction](#introduction)
2. [Configuration initiale](#configuration-initiale)
3. [Documentation des contrôleurs](#documentation-des-contrôleurs)
4. [Documentation des DTOs](#documentation-des-dtos)
5. [Authentification Swagger](#authentification-swagger)
6. [Bonnes pratiques](#bonnes-pratiques)
7. [Test et validation](#test-et-validation)

## Introduction

Ce guide explique comment implémenter la documentation OpenAPI/Swagger dans l'API Xeption E-commerce. Il fournit des instructions pratiques pour documenter efficacement les endpoints et les DTOs.

## Configuration initiale

### 1. Installation des dépendances

Si ce n'est pas déjà fait, installez les packages Swagger nécessaires :

```bash
npm install @nestjs/swagger swagger-ui-express
```

### 2. Configuration dans main.ts

Assurez-vous que le fichier `main.ts` contient la configuration Swagger suivante :

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

## Documentation des contrôleurs

### Étape 1: Importer les décorateurs Swagger

Dans chaque fichier de contrôleur, importez les décorateurs nécessaires :

```typescript
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
  ApiParam, ApiQuery, ApiBody
} from '@nestjs/swagger';
```

### Étape 2: Annoter le contrôleur

Utilisez `@ApiTags` pour catégoriser les endpoints :

```typescript
@ApiTags('marketing')
@Controller('marketing')
export class MarketingController {
  // ...
}
```

### Étape 3: Documenter chaque endpoint

Pour chaque méthode, ajoutez les décorateurs suivants :

```typescript
@Get('banners')
@ApiOperation({ 
  summary: 'Récupérer les bannières actives', 
  description: 'Retourne toutes les bannières actives pour l\'affichage public.'
})
@ApiResponse({ 
  status: 200, 
  description: 'Liste des bannières actives', 
  type: [MarketingBannerResponseDto]
})
async getActiveBanners(): Promise<MarketingBannerResponseDto[]> {
  // Implementation
}
```

### Étape 4: Documenter les paramètres

Pour les paramètres de route et de requête :

```typescript
@Get('banners/:id')
@ApiOperation({ summary: 'Récupérer une bannière par ID' })
@ApiParam({ name: 'id', description: 'ID de la bannière' })
@ApiResponse({ status: 200, type: MarketingBannerResponseDto })
@ApiResponse({ status: 404, description: 'Bannière non trouvée' })
async getBannerById(@Param('id') id: string): Promise<MarketingBannerResponseDto> {
  // Implementation
}

@Get('search')
@ApiOperation({ summary: 'Rechercher des bannières' })
@ApiQuery({ 
  name: 'query', 
  required: true,
  description: 'Terme de recherche' 
})
@ApiQuery({ 
  name: 'active',
  required: false,
  type: Boolean,
  description: 'Filtrer par état d\'activation' 
})
@ApiResponse({ status: 200, type: [MarketingBannerResponseDto] })
async searchBanners(
  @Query('query') query: string,
  @Query('active') active?: boolean
): Promise<MarketingBannerResponseDto[]> {
  // Implementation
}
```

### Étape 5: Documenter les endpoints sécurisés

Pour les endpoints nécessitant une authentification :

```typescript
@Post('admin/banners')
@UseGuards(AuthGuard, RoleGuard)
@Roles('admin')
@ApiBearerAuth()
@ApiOperation({ summary: 'Créer une nouvelle bannière' })
@ApiBody({ type: CreateMarketingBannerDto })
@ApiResponse({ status: 201, type: MarketingBannerResponseDto })
@ApiResponse({ status: 401, description: 'Non autorisé' })
@ApiResponse({ status: 403, description: 'Accès interdit' })
async createBanner(
  @Body() createBannerDto: CreateMarketingBannerDto,
  @CurrentUser() user: AuthenticatedUser,
): Promise<MarketingBannerResponseDto> {
  // Implementation
}
```

## Documentation des DTOs

### Étape 1: Importer les décorateurs

Dans chaque fichier DTO, importez les décorateurs nécessaires :

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
```

### Étape 2: Documenter chaque propriété

Pour chaque propriété du DTO, ajoutez les décorateurs appropriés :

```typescript
export class CreateMarketingBannerDto {
  @ApiProperty({
    description: 'Titre de la bannière',
    example: 'Promotion de printemps',
  })
  @IsString()
  title_237: string;

  @ApiPropertyOptional({
    description: 'Description détaillée de la bannière',
    example: 'Profitez de 20% de réduction sur tous les smartphones',
  })
  @IsOptional()
  @IsString()
  description_237?: string;

  @ApiProperty({
    description: 'URL de l\'image de la bannière',
    example: 'https://storage.xeption.cm/banners/spring-promo.jpg',
  })
  @IsUrl()
  image_url: string;

  @ApiPropertyOptional({
    description: 'URL de destination au clic sur la bannière',
    example: 'https://xeption.cm/promotions/printemps',
  })
  @IsOptional()
  @IsUrl()
  cta_url?: string;

  // Autres propriétés...
}
```

### Étape 3: Documenter les énumérations

Pour les propriétés utilisant des énumérations :

```typescript
export class UpdateRFQStatusDto {
  @ApiProperty({
    description: 'Nouveau statut de la demande de devis',
    enum: RFQStatus,
    example: RFQStatus.APPROVED,
  })
  @IsEnum(RFQStatus)
  status: RFQStatus;

  @ApiPropertyOptional({
    description: 'Commentaire sur la mise à jour du statut',
    example: 'Devis approuvé par le responsable des achats',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
```

### Étape 4: Documenter les tableaux et les objets imbriqués

Pour les propriétés de type tableau ou objet :

```typescript
export class CreateRFQRequestDto {
  // Autres propriétés...

  @ApiProperty({
    description: 'Liste des articles demandés',
    type: [CreateRFQItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRFQItemDto)
  items: CreateRFQItemDto[];
}

export class CreateOrderDto {
  // Autres propriétés...

  @ApiProperty({
    description: 'Adresse de livraison',
    type: ShippingAddressDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;
}
```

## Authentification Swagger

### Étape 1: Configuration de l'authentification Bearer

Dans `main.ts`, assurez-vous d'avoir ajouté la configuration Bearer :

```typescript
const config = new DocumentBuilder()
  // Autres configurations...
  .addBearerAuth()
  .build();
```

### Étape 2: Annotation des endpoints sécurisés

Pour chaque endpoint nécessitant une authentification, utilisez le décorateur `@ApiBearerAuth()` :

```typescript
@Post('admin/banners')
@UseGuards(AuthGuard, RoleGuard)
@Roles('admin')
@ApiBearerAuth()
@ApiOperation({ summary: 'Créer une nouvelle bannière' })
// Autres décorateurs...
async createBanner() {
  // Implementation
}
```

## Bonnes pratiques

### 1. Utiliser des exemples pertinents

Fournissez des exemples réalistes pour chaque propriété de DTO :

```typescript
@ApiProperty({
  description: 'Prix unitaire en FCFA',
  example: 150000,
  minimum: 1,
})
```

### 2. Documenter les réponses d'erreur

N'oubliez pas de documenter les réponses d'erreur possibles :

```typescript
@ApiResponse({ status: 200, type: MarketingBannerResponseDto })
@ApiResponse({ status: 400, description: 'Données invalides' })
@ApiResponse({ status: 401, description: 'Non autorisé' })
@ApiResponse({ status: 404, description: 'Bannière non trouvée' })
```

### 3. Catégoriser clairement les endpoints

Utilisez des commentaires pour regrouper visuellement les endpoints par fonctionnalité :

```typescript
/**
 * PUBLIC ENDPOINTS
 */
// Endpoints publics ici...

/**
 * ADMIN ENDPOINTS
 */
// Endpoints d'administration ici...
```

### 4. Associer la documentation aux validateurs

Assurez-vous que vos décorateurs Swagger sont cohérents avec les validateurs class-validator :

```typescript
@ApiProperty({
  description: 'Quantité demandée',
  example: 10,
  minimum: 1,
})
@IsNumber()
@Min(1)
qty: number;
```

### 5. Utiliser des types génériques pour les réponses standard

Pour les réponses standard, utilisez des types génériques :

```typescript
export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Liste des éléments',
  })
  items: T[];

  @ApiProperty({
    description: 'Nombre total d\'éléments',
    example: 42,
  })
  total: number;

  @ApiProperty({
    description: 'Page actuelle',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Nombre d\'éléments par page',
    example: 10,
  })
  limit: number;
}

// Utilisation
@ApiResponse({
  status: 200,
  description: 'Liste paginée des bannières',
  type: PaginatedResponseDto<MarketingBannerResponseDto>,
})
```

## Test et validation

### 1. Vérifier l'interface Swagger

Après avoir implémenté la documentation, accédez à l'URL Swagger pour vérifier le résultat :

```
http://localhost:3000/api-docs
```

### 2. Tester les endpoints

Utilisez l'interface Swagger pour tester les endpoints et vérifier qu'ils fonctionnent comme prévu.

### 3. Valider le schéma OpenAPI

Générez le fichier JSON OpenAPI et validez-le avec des outils comme Swagger Validator :

```typescript
// Dans main.ts
const document = SwaggerModule.createDocument(app, config);

// Générer le fichier JSON
import * as fs from 'fs';
import { resolve } from 'path';

fs.writeFileSync(
  resolve(process.cwd(), 'openapi-spec.json'),
  JSON.stringify(document, null, 2),
);
```

## Conclusion

En suivant ce guide, vous devriez être en mesure d'implémenter efficacement la documentation Swagger pour l'API Xeption E-commerce. Une documentation bien structurée améliore considérablement l'expérience des développeurs qui travaillent avec l'API, qu'ils soient de l'équipe frontend ou des partenaires externes.

Pour des exemples plus détaillés de contrôleurs et DTOs documentés, reportez-vous au fichier `endpoint-documentation-examples.md`.