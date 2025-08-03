# Analyse du Backend - Projet Xeption Ecommerce

## 1. Structure de la base de données (Prisma Schema)

Le fichier `backend/prisma/schema.prisma` définit la structure complète de la base de données PostgreSQL utilisée par l'application. Voici les points clés :

### Enums principaux

- `UserRole` : client, agent, admin
- `OrderStatusEnum` : new, processing, shipped, delivered, cancelled
- `PaymentStatusEnum` : pending, paid, failed, refunded
- `PaymentMethodEnum` : om, momo, card, cash, paypal
- `TradeStatusEnum` : pending, accepted, rejected, completed, cancelled, quoted
- `PhysicalConditionEnum` : excellent, good, fair, poor, damaged
- `BatteryStateEnum` : excellent, good, average, poor, needs_replacement
- `BackOrderStatusEnum` : open, sourced, ordered, cancelled
- `BudgetStatusEnum` : open, in_consult, closed
- `RepairStatusEnum` : scheduled, in_progress, completed, cancelled
- `RfqStatusEnum` : new, answered, won, lost, draft, submitted, under_review, quoted, rejected, approved, closed
- `ProductTierEnum` : entry, standard, premium, pro
- `InventoryReasonEnum` : purchase, return, manual, sale, adjust

### Modèles principaux

- `User` : Utilisateurs avec email, mot de passe, rôle, points de fidélité, langue préférée, et relations vers adresses, commandes, panier, demandes de réparation, etc.
- `Product` : Produits avec SKU, nom, catégorie, prix, stock, poids, description, marque, variantes, images, caractéristiques, promotions, etc.
- `Order` : Commandes avec montant, frais de livraison, statut, méthode de paiement, adresse de livraison, items commandés, etc.
- `Cart` et `CartItem` : Panier d'achat et ses items.
- `TradeIn` : Reprise d'appareils avec état physique, batterie, devis, photos, etc.
- `RepairJob` : Demandes de réparation avec description du problème, date préférée, statut, notes technicien, etc.
- `Delivery` : Zones de livraison avec frais, délai, paiement à la livraison.
- `BackOrder` et `BackOrderNotification` : Commandes en attente et notifications associées.
- `BudgetAdvisory` : Conseils budgétaires avec contexte d'usage et suggestions.
- `Rfq` et `RfqItem` : Demandes de devis avec items associés.
- `MarketingBanner` et `Promotion` : Bannières marketing et promotions produits.
- `AuditLog` : Journal d'audit des actions utilisateurs.

Les relations entre modèles sont bien définies avec des clés étrangères et des annotations Prisma.

---

## 2. Structure du Backend NestJS (AppModule)

Le fichier `backend/src/app.module.ts` montre la composition principale du backend :

- Modules importés :
  - `ConfigModule` : gestion de la configuration globale avec validation
  - `PrismaModule` : accès à la base via Prisma
  - `AuthModule` : authentification
  - `UsersModule` : gestion des utilisateurs
  - `CatalogModule` : gestion du catalogue produits
  - `CartOrderModule` : gestion du panier et commandes
  - `DeliveryModule` : gestion des livraisons
  - `TradeInModule` : gestion des reprises d'appareils
  - `AdvisoryModule` : gestion des conseils budgétaires
  - `RFQModule` : gestion des demandes de devis
  - `MarketingModule` : gestion marketing (bannières, promotions)

- Fournisseur global `RoleGuard` pour la gestion des rôles et permissions.

---

## 3. Module Catalogue

Le module `CatalogModule` (backend/src/modules/catalog/catalog.module.ts) :

- Importe `PrismaModule`
- Fournit `CatalogController` et `CatalogService`
- Utilise deux cas d'utilisation (use-cases) :
  - `GetProductUseCase` : récupération d'un produit
  - `ListProductsUseCase` : liste des produits
- Injecte un repository `PrismaProductRepository` via le token `PRODUCT_REPOSITORY`

Le service `CatalogService` (backend/src/modules/catalog/catalog.service.ts) expose des méthodes pour :

- Récupérer un produit par id ou SKU
- Lister les produits avec options
- Obtenir les produits en vedette
- Obtenir les produits par catégorie ou marque
- Rechercher des produits par texte


