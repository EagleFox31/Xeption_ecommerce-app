# Plan de Route - Complétion du Domaine CATALOG

## Vue d'ensemble
Le domaine CATALOG est actuellement incomplet avec seulement 2/12 use cases implémentés (83% manquant). C'est le domaine le plus critique à compléter car il gère les produits, catégories et marques - éléments centraux de l'e-commerce.

## État Actuel

### ✅ **Existant**
- `get-product.use-case.ts` - Récupération d'un produit
- `list-products.use-case.ts` - Liste des produits avec filtres
- `product.entity.ts` - Entité Product complète
- `product.port.ts` - Port avec interfaces de base (lecture seule)

### ❌ **Manquant (10 use cases)**
1. **Produits (3 use cases)**
   - `create-product.use-case.ts`
   - `update-product.use-case.ts` 
   - `delete-product.use-case.ts`

2. **Catégories (4 use cases)**
   - `create-category.use-case.ts`
   - `update-category.use-case.ts`
   - `delete-category.use-case.ts`
   - `get-categories.use-case.ts`

3. **Marques (4 use cases)**
   - `create-brand.use-case.ts`
   - `update-brand.use-case.ts`
   - `delete-brand.use-case.ts`
   - `get-brands.use-case.ts`

---

## Plan d'Implémentation

### **Phase 1: Extension des Entités et Ports** 🏗️

#### 1.1 Créer les entités manquantes
- `category.entity.ts` - Entité Category avec hiérarchie
- `brand.entity.ts` - Entité Brand
- `product-variant.entity.ts` - Entité ProductVariant (si nécessaire)

#### 1.2 Étendre les ports existants
- Étendre `product.port.ts` avec méthodes CRUD complètes
- Créer `category.port.ts` avec gestion hiérarchique
- Créer `brand.port.ts` avec CRUD de base

### **Phase 2: Use Cases Produits** 📦

#### 2.1 Create Product Use Case
```typescript
// backend/src/application/catalog/create-product.use-case.ts
- Validation des données produit
- Génération automatique SKU
- Gestion des images
- Gestion des spécifications
- Gestion du stock initial
- Intégration avec inventory logs
```

#### 2.2 Update Product Use Case
```typescript
// backend/src/application/catalog/update-product.use-case.ts
- Mise à jour partielle ou complète
- Gestion des changements de prix
- Mise à jour du stock
- Gestion des promotions
- Audit des modifications
```

#### 2.3 Delete Product Use Case
```typescript
// backend/src/application/catalog/delete-product.use-case.ts
- Soft delete (is_active = false)
- Vérification des dépendances (commandes, panier)
- Gestion des variantes
- Nettoyage des relations
```

### **Phase 3: Use Cases Catégories** 📂

#### 3.1 Get Categories Use Case
```typescript
// backend/src/application/catalog/get-categories.use-case.ts
- Liste hiérarchique des catégories
- Filtrage par parent
- Comptage des produits par catégorie
- Support pagination
```

#### 3.2 Create Category Use Case
```typescript
// backend/src/application/catalog/create-category.use-case.ts
- Validation hiérarchie (pas de cycles)
- Génération automatique slug
- Gestion du préfixe SKU
- Création des relations parent/enfant
```

#### 3.3 Update Category Use Case
```typescript
// backend/src/application/catalog/update-category.use-case.ts
- Mise à jour des métadonnées
- Changement de parent (avec validation)
- Mise à jour du slug
- Impact sur les produits associés
```

#### 3.4 Delete Category Use Case
```typescript
// backend/src/application/catalog/delete-category.use-case.ts
- Vérification des sous-catégories
- Vérification des produits associés
- Réassignation ou suppression en cascade
- Soft delete avec audit
```

### **Phase 4: Use Cases Marques** 🏷️

#### 4.1 Get Brands Use Case
```typescript
// backend/src/application/catalog/get-brands.use-case.ts
- Liste complète des marques
- Filtrage par catégorie
- Comptage des produits par marque
- Support pagination et recherche
```

#### 4.2 Create Brand Use Case
```typescript
// backend/src/application/catalog/create-brand.use-case.ts
- Validation unicité nom
- Génération automatique slug
- Gestion du logo
- Relations avec catégories
```

#### 4.3 Update Brand Use Case
```typescript
// backend/src/application/catalog/update-brand.use-case.ts
- Mise à jour métadonnées
- Changement de logo
- Mise à jour des relations
- Impact sur les produits
```

#### 4.4 Delete Brand Use Case
```typescript
// backend/src/application/catalog/delete-brand.use-case.ts
- Vérification des produits associés
- Réassignation ou suppression
- Soft delete avec audit
- Nettoyage des relations
```

### **Phase 5: Extension Infrastructure** 🔧

#### 5.1 Étendre ProductRepository
```typescript
// backend/src/infrastructure/prisma/repositories/product.repository.ts
- Ajouter méthodes create, update, delete
- Gestion des transactions complexes
- Optimisation des requêtes avec relations
- Gestion des variantes et images
```

#### 5.2 Créer CategoryRepository
```typescript
// backend/src/infrastructure/prisma/repositories/category.repository.ts
- CRUD complet avec hiérarchie
- Requêtes récursives pour arbre
- Comptage des produits
- Gestion des relations parent/enfant
```

#### 5.3 Créer BrandRepository
```typescript
// backend/src/infrastructure/prisma/repositories/brand.repository.ts
- CRUD de base
- Relations avec catégories
- Comptage des produits
- Recherche et filtrage
```

### **Phase 6: DTOs et Validation** 📋

#### 6.1 DTOs Produits
```typescript
// backend/src/modules/catalog/dto/
- CreateProductDto avec validation complète
- UpdateProductDto avec validation partielle
- ProductResponseDto pour les réponses
- ProductFiltersDto pour les filtres avancés
```

#### 6.2 DTOs Catégories
```typescript
- CreateCategoryDto avec validation hiérarchie
- UpdateCategoryDto
- CategoryTreeDto pour l'arbre hiérarchique
- CategoryWithCountDto avec comptage produits
```

#### 6.3 DTOs Marques
```typescript
- CreateBrandDto avec validation
- UpdateBrandDto
- BrandWithCountDto avec comptage produits
- BrandFiltersDto
```

### **Phase 7: Controllers et Endpoints** 🌐

#### 7.1 Étendre CatalogController
```typescript
// backend/src/modules/catalog/catalog.controller.ts
- POST /products - Création produit
- PUT /products/:id - Mise à jour produit
- DELETE /products/:id - Suppression produit
- GET /categories - Liste catégories
- POST /categories - Création catégorie
- PUT /categories/:id - Mise à jour catégorie
- DELETE /categories/:id - Suppression catégorie
- GET /brands - Liste marques
- POST /brands - Création marque
- PUT /brands/:id - Mise à jour marque
- DELETE /brands/:id - Suppression marque
```

### **Phase 8: Tests** 🧪

#### 8.1 Tests Unitaires Use Cases
```typescript
// backend/src/test/catalog/
- create-product.use-case.spec.ts
- update-product.use-case.spec.ts
- delete-product.use-case.spec.ts
- get-categories.use-case.spec.ts
- create-category.use-case.spec.ts
- update-category.use-case.spec.ts
- delete-category.use-case.spec.ts
- get-brands.use-case.spec.ts
- create-brand.use-case.spec.ts
- update-brand.use-case.spec.ts
- delete-brand.use-case.spec.ts
```

#### 8.2 Tests d'Intégration
```typescript
- catalog.controller.spec.ts
- product.repository.spec.ts
- category.repository.spec.ts
- brand.repository.spec.ts
```

---

## Priorités d'Implémentation

### **🔥 Priorité 1 (Critique)**
1. **Create Product Use Case** - Essentiel pour ajouter des produits
2. **Update Product Use Case** - Gestion du stock et prix
3. **Get Categories Use Case** - Navigation du catalogue

### **⚡ Priorité 2 (Important)**
4. **Create Category Use Case** - Organisation du catalogue
5. **Get Brands Use Case** - Filtrage par marque
6. **Delete Product Use Case** - Gestion du cycle de vie

### **📈 Priorité 3 (Amélioration)**
7. **Update/Delete Category Use Cases** - Gestion avancée
8. **Create/Update/Delete Brand Use Cases** - Gestion complète marques

---

## Estimation Temporelle

### **Phase 1-2: Produits** (3-4 jours)
- Entités et ports: 0.5 jour
- 3 use cases produits: 2 jours
- Tests: 1 jour
- Infrastructure: 0.5 jour

### **Phase 3: Catégories** (2-3 jours)
- 4 use cases catégories: 2 jours
- Tests et infrastructure: 1 jour

### **Phase 4: Marques** (2 jours)
- 4 use cases marques: 1.5 jour
- Tests et infrastructure: 0.5 jour

### **Phase 5-7: Infrastructure et API** (2 jours)
- Repositories: 1 jour
- Controllers et DTOs: 1 jour

### **Total Estimé: 9-11 jours**

---

## Dépendances et Risques

### **Dépendances**
- ✅ Prisma schema déjà défini
- ✅ Architecture hexagonale en place
- ✅ Patterns établis (Auth, Marketing)
- ❌ Services de validation à créer
- ❌ Gestion des images à implémenter

### **Risques**
1. **Complexité hiérarchique catégories** - Requêtes récursives
2. **Gestion des relations** - Intégrité référentielle
3. **Performance** - Optimisation des requêtes avec relations
4. **Migration données** - Si changements de structure

---

## Critères de Succès

### **Fonctionnel**
- ✅ CRUD complet pour produits, catégories, marques
- ✅ Gestion hiérarchique des catégories
- ✅ Validation complète des données
- ✅ Gestion des relations et contraintes

### **Technique**
- ✅ Couverture de tests > 80%
- ✅ Respect de l'architecture hexagonale
- ✅ Performance acceptable (< 200ms par requête)
- ✅ Documentation API complète

### **Métier**
- ✅ Interface d'administration fonctionnelle
- ✅ Gestion du stock en temps réel
- ✅ Support des promotions et remises
- ✅ Audit trail complet

---

## Prochaines Étapes Immédiates

1. **Valider le plan** avec l'équipe
2. **Créer les entités manquantes** (Category, Brand)
3. **Étendre les ports** avec méthodes CRUD
4. **Implémenter Create Product Use Case** (priorité 1)
5. **Créer les tests unitaires** correspondants

**Prêt à commencer l'implémentation !** 🚀
