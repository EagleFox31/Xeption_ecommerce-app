# Documentation des DTOs avec Swagger - Référence Pratique

Ce document fournit des exemples concrets pour documenter les DTOs (Data Transfer Objects) avec Swagger dans l'API Xeption E-commerce. Il est conçu comme un guide pratique et une référence pour les développeurs qui doivent ajouter ou mettre à jour des DTOs dans le projet.

## Table des matières
1. [Introduction](#introduction)
2. [Types de base](#types-de-base)
3. [Validations](#validations)
4. [Types complexes](#types-complexes)
5. [Exemples par module](#exemples-par-module)
   - [Marketing](#marketing)
   - [RFQ (Demandes de devis)](#rfq-demandes-de-devis)
   - [TradeIn (Reprise d'appareils)](#tradein-reprise-dappareils)
   - [CartOrder (Panier et commandes)](#cartorder-panier-et-commandes)

## Introduction

La documentation des DTOs avec Swagger est essentielle pour générer une documentation API claire et facilement utilisable. Cette documentation aide les développeurs frontend et les intégrateurs à comprendre la structure des données attendues par l'API.

## Types de base

Voici comment documenter les types de base dans vos DTOs:

### Chaînes de caractères

```typescript
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExampleDto {
  @ApiProperty({
    description: 'Nom du produit',
    example: 'iPhone 12 Pro',
    minLength: 3,
    maxLength: 100
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Description du produit',
    example: 'Smartphone haut de gamme avec triple caméra',
    nullable: true
  })
  @IsOptional()
  @IsString()
  description?: string;
}
```

### Nombres

```typescript
import { IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ExampleDto {
  @ApiProperty({
    description: 'Prix du produit en FCFA',
    example: 450000,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Quantité en stock',
    example: 42,
    minimum: 0,
    maximum: 1000
  })
  @IsNumber()
  @Min(0)
  @Max(1000)
  stockQuantity: number;
}
```

### Booléens

```typescript
import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ExampleDto {
  @ApiProperty({
    description: 'Indique si le produit est disponible',
    example: true,
    default: true
  })
  @IsBoolean()
  isAvailable: boolean;
}
```

### Dates

```typescript
import { IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExampleDto {
  @ApiProperty({
    description: 'Date de création (format ISO)',
    example: '2025-07-05T14:30:00Z'
  })
  @IsDateString()
  createdAt: string;

  @ApiPropertyOptional({
    description: 'Date d\'expiration (format ISO)',
    example: '2026-07-05T14:30:00Z'
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
```

## Validations

### Chaînes avec format spécifique

```typescript
import { IsEmail, IsUrl, IsUUID, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ExampleDto {
  @ApiProperty({
    description: 'Adresse email',
    example: 'contact@xeption.cm'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'URL du site web',
    example: 'https://xeption.cm'
  })
  @IsUrl()
  website: string;

  @ApiProperty({
    description: 'Identifiant unique',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Numéro de téléphone',
    example: '+237612345678'
  })
  @IsPhoneNumber()
  phoneNumber: string;
}
```

### Énumérations

```typescript
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}

export class ExampleDto {
  @ApiProperty({
    description: 'Rôle de l\'utilisateur',
    enum: UserRole,
    example: UserRole.USER,
    enumName: 'UserRole'
  })
  @IsEnum(UserRole)
  role: UserRole;
}
```

## Types complexes

### Tableaux

```typescript
import { IsArray, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class TagDto {
  @ApiProperty({
    description: 'Nom du tag',
    example: 'électronique'
  })
  @IsString()
  name: string;
}

export class ExampleDto {
  @ApiProperty({
    description: 'Liste des catégories',
    example: ['smartphone', 'accessoire', 'ordinateur'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  categories: string[];

  @ApiProperty({
    description: 'Tags associés au produit',
    type: [TagDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TagDto)
  tags: TagDto[];
}
```

### Objets imbriqués

```typescript
import { IsObject, ValidateNested, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class DimensionsDto {
  @ApiProperty({
    description: 'Hauteur en mm',
    example: 150
  })
  @IsNumber()
  height: number;

  @ApiProperty({
    description: 'Largeur en mm',
    example: 75
  })
  @IsNumber()
  width: number;

  @ApiProperty({
    description: 'Profondeur en mm',
    example: 8
  })
  @IsNumber()
  depth: number;
}

export class ExampleDto {
  @ApiProperty({
    description: 'Nom du produit',
    example: 'Smartphone XYZ'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Dimensions du produit',
    type: DimensionsDto
  })
  @IsObject()
  @ValidateNested()
  @Type(() => DimensionsDto)
  dimensions: DimensionsDto;
}
```

## Exemples par module

### Marketing

```typescript
import { IsString, IsOptional, IsBoolean, IsNumber, IsDateString, IsUrl, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMarketingBannerDto {
  @ApiProperty({
    description: 'Titre de la bannière',
    example: 'Promotion de Printemps',
    maxLength: 100
  })
  @IsString()
  title_237: string;

  @ApiPropertyOptional({
    description: 'Description détaillée de la bannière',
    example: 'Profitez de 20% de réduction sur tous les smartphones',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  description_237?: string;

  @ApiProperty({
    description: 'URL de l\'image de la bannière',
    example: 'https://storage.xeption.cm/banners/spring-promo.jpg'
  })
  @IsUrl()
  image_url: string;

  @ApiPropertyOptional({
    description: 'URL de destination au clic sur la bannière',
    example: 'https://xeption.cm/promotions/printemps'
  })
  @IsOptional()
  @IsUrl()
  cta_url?: string;

  @ApiPropertyOptional({
    description: 'ID de la catégorie associée à la bannière',
    example: 'smartphones'
  })
  @IsOptional()
  @IsString()
  category_id?: string;

  @ApiProperty({
    description: 'Priorité d\'affichage (0 = plus faible, 100 = plus élevée)',
    example: 50,
    minimum: 0,
    maximum: 100
  })
  @IsNumber()
  @Min(0)
  priority: number;

  @ApiProperty({
    description: 'Date de début d\'affichage (format ISO)',
    example: '2025-07-01T00:00:00Z'
  })
  @IsDateString()
  start_date: string;

  @ApiProperty({
    description: 'Date de fin d\'affichage (format ISO)',
    example: '2025-07-31T23:59:59Z'
  })
  @IsDateString()
  end_date: string;

  @ApiProperty({
    description: 'Indique si la bannière est active',
    example: true,
    default: true
  })
  @IsBoolean()
  active: boolean;
}

export class ToggleBannerStatusDto {
  @ApiProperty({
    description: 'Nouvel état d\'activation de la bannière',
    example: false
  })
  @IsBoolean()
  active: boolean;
}
```

### RFQ (Demandes de devis)

```typescript
import { IsString, IsEmail, IsOptional, IsNumber, IsBoolean, IsArray, ValidateNested, IsEnum, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RFQStatus } from '../../../domain/rfq/rfq.entity';

export class CreateRFQItemDto {
  @ApiProperty({
    description: 'ID de la catégorie de produit',
    example: 5
  })
  @IsNumber()
  categoryId: number;

  @ApiProperty({
    description: 'Quantité demandée',
    example: 10,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  qty: number;

  @ApiPropertyOptional({
    description: 'Spécifications techniques demandées',
    example: 'Processeur i7 ou équivalent, min 16GB RAM'
  })
  @IsOptional()
  @IsString()
  specsNote?: string;
}

export class CreateRFQRequestDto {
  @ApiProperty({
    description: 'Nom de l\'entreprise',
    example: 'ACME Corporation'
  })
  @IsString()
  companyName: string;

  @ApiProperty({
    description: 'Nom du contact',
    example: 'John Doe'
  })
  @IsString()
  contactName: string;

  @ApiProperty({
    description: 'Email du contact',
    example: 'john.doe@acme.com'
  })
  @IsEmail()
  contactEmail: string;

  @ApiPropertyOptional({
    description: 'Budget minimum (en FCFA)',
    example: 500000
  })
  @IsOptional()
  @IsNumber()
  budgetMinXaf?: number;

  @ApiPropertyOptional({
    description: 'Budget maximum (en FCFA)',
    example: 1000000
  })
  @IsOptional()
  @IsNumber()
  budgetMaxXaf?: number;

  @ApiPropertyOptional({
    description: 'Indique si la demande est urgente',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;

  @ApiPropertyOptional({
    description: 'Commentaires additionnels',
    example: 'Nous avons besoin de ces équipements pour notre nouveau bureau.'
  })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({
    description: 'Date limite souhaitée (format ISO)',
    example: '2025-08-15T00:00:00Z'
  })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiProperty({
    description: 'Liste des articles demandés',
    type: [CreateRFQItemDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRFQItemDto)
  items: CreateRFQItemDto[];
}

export class UpdateRFQStatusDto {
  @ApiProperty({
    description: 'Nouveau statut de la demande',
    enum: RFQStatus,
    enumName: 'RFQStatus',
    example: RFQStatus.APPROVED
  })
  @IsEnum(RFQStatus)
  status: RFQStatus;

  @ApiPropertyOptional({
    description: 'Commentaire sur la mise à jour du statut',
    example: 'Devis approuvé par le responsable des achats'
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
```

### TradeIn (Reprise d'appareils)

```typescript
import { IsString, IsEnum, IsOptional, IsArray, IsNumber, Min, Max, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeviceCondition, TradeInStatus } from '../../../domain/tradein/tradein.entity';

export class CreateTradeInRequestDto {
  @ApiProperty({
    description: 'ID de l\'appareil à reprendre',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  })
  @IsUUID()
  deviceId: string;

  @ApiProperty({
    description: 'État de l\'appareil',
    enum: DeviceCondition,
    enumName: 'DeviceCondition',
    example: DeviceCondition.GOOD
  })
  @IsEnum(DeviceCondition)
  condition: DeviceCondition;

  @ApiPropertyOptional({
    description: 'Description de l\'état de l\'appareil',
    example: 'Quelques rayures sur l\'écran, fonctionne parfaitement'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'URLs des photos de l\'appareil',
    example: ['https://storage.xeption.cm/tradein/photo1.jpg', 'https://storage.xeption.cm/tradein/photo2.jpg'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

export class EvaluateTradeInDto {
  @ApiProperty({
    description: 'État confirmé de l\'appareil après évaluation',
    enum: DeviceCondition,
    enumName: 'DeviceCondition',
    example: DeviceCondition.FAIR
  })
  @IsEnum(DeviceCondition)
  condition: DeviceCondition;

  @ApiProperty({
    description: 'Score de fonctionnalité (0-100)',
    example: 85,
    minimum: 0,
    maximum: 100
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  functionalityScore: number;

  @ApiProperty({
    description: 'Score esthétique (0-100)',
    example: 70,
    minimum: 0,
    maximum: 100
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  cosmeticScore: number;

  @ApiProperty({
    description: 'Notes de l\'évaluateur',
    example: 'Batterie à 82% de capacité, bouton volume défectueux'
  })
  @IsString()
  notes: string;
}

export class UpdateTradeInStatusDto {
  @ApiProperty({
    description: 'Nouveau statut de la demande de reprise',
    enum: TradeInStatus,
    enumName: 'TradeInStatus',
    example: TradeInStatus.ACCEPTED
  })
  @IsEnum(TradeInStatus)
  status: TradeInStatus;

  @ApiPropertyOptional({
    description: 'Notes de l\'évaluateur',
    example: 'Offre acceptée par le client par téléphone'
  })
  @IsOptional()
  @IsString()
  evaluatorNotes?: string;
}
```

### CartOrder (Panier et commandes)

```typescript
import { IsString, IsNumber, IsPositive, IsOptional, IsObject, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '../../../domain/cartorder/order.entity';
import { PaymentMethod, PaymentProvider, PaymentStatus } from '../../../domain/cartorder/payment.entity';

export class AddCartItemDto {
  @ApiProperty({
    description: 'ID du produit à ajouter au panier',
    example: 'prod_12345'
  })
  @IsString()
  productId: string;

  @ApiProperty({
    description: 'Quantité désirée',
    example: 2,
    minimum: 1
  })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({
    description: 'Prix unitaire en FCFA',
    example: 150000
  })
  @IsNumber()
  @IsPositive()
  unitPrice: number;
}

export class ShippingAddressDto {
  @ApiProperty({
    description: 'Rue et numéro',
    example: '123 Rue Principale'
  })
  @IsString()
  street: string;

  @ApiProperty({
    description: 'Ville',
    example: 'Douala'
  })
  @IsString()
  city: string;

  @ApiProperty({
    description: 'Région/État',
    example: 'Littoral'
  })
  @IsString()
  state: string;

  @ApiProperty({
    description: 'Code postal',
    example: '00237'
  })
  @IsString()
  postalCode: string;

  @ApiProperty({
    description: 'Pays',
    example: 'Cameroun'
  })
  @IsString()
  country: string;

  @ApiPropertyOptional({
    description: 'Numéro de téléphone',
    example: '+237612345678'
  })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'ID du panier à convertir en commande',
    example: 'cart_67890'
  })
  @IsString()
  cartId: string;

  @ApiProperty({
    description: 'Adresse de livraison',
    type: ShippingAddressDto
  })
  @IsObject()
  shippingAddress: ShippingAddressDto;

  @ApiPropertyOptional({
    description: 'Adresse de facturation (si différente de l\'adresse de livraison)',
    type: ShippingAddressDto
  })
  @IsOptional()
  @IsObject()
  billingAddress?: ShippingAddressDto;

  @ApiPropertyOptional({
    description: 'Notes pour la commande',
    example: 'Livrer le matin avant 12h00 SVP'
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'Nouveau statut de la commande',
    enum: OrderStatus,
    enumName: 'OrderStatus',
    example: OrderStatus.SHIPPED
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

export class CreatePaymentDto {
  @ApiProperty({
    description: 'ID de la commande à payer',
    example: 'order_12345'
  })
  @IsString()
  orderId: string;

  @ApiProperty({
    description: 'Montant du paiement en FCFA',
    example: 450000
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Devise',
    example: 'XAF'
  })
  @IsString()
  currency: string;

  @ApiProperty({
    description: 'Méthode de paiement',
    enum: PaymentMethod,
    enumName: 'PaymentMethod',
    example: PaymentMethod.MOBILE_MONEY
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Fournisseur de paiement',
    enum: PaymentProvider,
    enumName: 'PaymentProvider',
    example: PaymentProvider.ORANGE_MONEY
  })
  @IsEnum(PaymentProvider)
  paymentProvider: PaymentProvider;

  @ApiPropertyOptional({
    description: 'Métadonnées supplémentaires pour le paiement',
    example: { customerPhone: '+237612345678', transactionSource: 'web' }
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class ProcessPaymentDto {
  @ApiProperty({
    description: 'ID de transaction du fournisseur de paiement',
    example: 'txn_9876543210'
  })
  @IsString()
  transactionId: string;

  @ApiProperty({
    description: 'Statut du paiement',
    enum: PaymentStatus,
    enumName: 'PaymentStatus',
    example: PaymentStatus.COMPLETED
  })
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @ApiPropertyOptional({
    description: 'Raison de l\'échec (si applicable)',
    example: 'Solde insuffisant'
  })
  @IsOptional()
  @IsString()
  failureReason?: string;
}
```

## Conclusion

Cette référence fournit des exemples pratiques pour documenter les différents types de DTOs dans l'API Xeption E-commerce. En suivant ces conventions, vous assurez une documentation cohérente et complète qui facilite l'intégration et l'utilisation de l'API.

Points importants à retenir:
- Toujours inclure une description claire pour chaque propriété
- Fournir des exemples réalistes
- Documenter les contraintes (min, max, etc.)
- Utiliser les décorateurs appropriés selon le type de données
- Garder la cohérence entre les validateurs et la documentation Swagger

Pour plus d'informations sur l'implémentation de la documentation Swagger, consultez le fichier `swagger-implementation-guide.md`.