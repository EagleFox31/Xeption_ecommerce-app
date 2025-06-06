# Xeption Network Backend BFF

Backend For Frontend (BFF) pour la plateforme e-commerce Xeption Network, construit avec NestJS et Supabase.

## 🏗️ Architecture

Ce projet suit une **architecture hexagonale** (ports et adaptateurs) avec une séparation claire des responsabilités :

- **Domain Layer** : Entités métier et ports (interfaces)
- **Application Layer** : Use cases (logique applicative)
- **Infrastructure Layer** : Adaptateurs (repositories, services externes)
- **Interface Layer** : Controllers NestJS

## 📁 Structure du Projet

```
src/
├── main.ts                     # Point d'entrée de l'application
├── app.module.ts              # Module racine
├── config/                    # Configuration et validation
├── common/                    # Code partagé
│   └── auth/                  # Guards, décorateurs, types JWT
├── domain/                    # Couche domaine
│   └── <module>/             # Entités et ports par module
├── application/               # Couche application
│   └── <module>/             # Use cases par module
├── infrastructure/            # Couche infrastructure
│   └── supabase/             # Repositories Supabase
├── modules/                   # Modules NestJS
│   └── <module>/             # Controllers et services
└── test/                      # Tests unitaires
```

## 📊 État des Modules Métier

### ✅ 1. Auth Module - **COMPLÉTÉ (100%)**
- ✅ AuthGuard JWT Supabase
- ✅ Décorateur `@CurrentUser()`
- ✅ Endpoints `/auth/me` et `/auth/validate`
- ✅ Architecture hexagonale complète
- ✅ Tests unitaires complets
- ✅ Configuration et validation

### 🔄 Modules à implémenter :
2. **users** : Profil utilisateur enrichi, adresses
3. **catalog** : Lecture produits, specs, filtres
4. **cartorder** : Panier, commande, paiement
5. **delivery** : Calcul des frais livraison 237
6. **tradein** : Demande de reprise produit
7. **advisory** : Demande de conseil d'achat par budget
8. **backorder** : Précommande produit hors stock
9. **repair** : Réparation, techniciens, planning
10. **rfq** : Devis pour entreprises
11. **marketing** : Bannières localisées 237

## 🚀 Technologies

- **NestJS v11** : Framework backend
- **Supabase** : Authentification et base de données
- **PostgreSQL** : Base de données
- **TypeScript** : Langage de programmation
- **Jest** : Tests unitaires
- **Architecture Hexagonale** : Séparation des couches

## ⚡ Installation Rapide

```bash
# Installation des dépendances
make install

# Configuration des variables d'environnement
# Éditez le fichier .env avec vos clés Supabase
vim .env

# Démarrage en développement
make dev
```

## 🔧 Configuration

### Variables d'Environnement

**⚠️ IMPORTANT** : Configurez ces variables dans `.env` :

```env
# Supabase (obligatoire)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# JWT (obligatoire)
JWT_SECRET=your_strong_jwt_secret_32_chars_minimum

# Application
PORT=3000
NODE_ENV=development
```

### Obtenir les clés Supabase :
1. Allez sur [supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Settings > API
4. Copiez l'URL et les clés

## 🎯 Commandes Disponibles

```bash
# Développement
make dev          # Démarrer en mode développement
make build        # Construire l'application
make start        # Démarrer en production

# Tests
make test         # Tous les tests
make test-watch   # Tests en mode watch
make test-cov     # Tests avec couverture

# Qualité
make lint         # Vérifier le code
make format       # Formater le code

# Maintenance
make clean        # Nettoyer les fichiers
make help         # Voir toutes les commandes
```

## 🔗 API Endpoints

### Auth Module (✅ Complété)

- `GET /api/v1/auth/me` - Profil utilisateur actuel
- `GET /api/v1/auth/validate` - Validation du token JWT

**Authentification requise :**
```bash
Authorization: Bearer <supabase_jwt_token>
```

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests avec couverture
npm run test:cov

# Tests en mode watch
npm run test:watch
```

**Couverture actuelle :** 100% pour le module auth

## ✅ Contraintes Techniques Respectées

- ✅ Supabase comme source de vérité pour Auth et données
- ✅ Pas de gestion manuelle de l'authentification (token seulement)
- ✅ Séparation hexagonale stricte
- ✅ Aucune logique métier dans les controllers
- ✅ Controllers REST contract-first
- ✅ Use Cases injectables/testables
- ✅ Typage strict TypeScript
- ✅ Tests unitaires complets

## 🎯 Prochaines Étapes

1. **Module Users** - Profil enrichi et adresses
2. **Module Catalog** - Produits et filtres
3. **Module CartOrder** - Panier et commandes
4. **Modules spécialisés** - Livraison, réparation, etc.

## 🤝 Contribution

1. Respecter l'architecture hexagonale
2. Écrire des tests unitaires
3. Suivre les conventions de nommage
4. Documenter les nouveaux endpoints
5. Maintenir la séparation des couches

## 📝 Notes de Développement

- **Architecture** : Hexagonale stricte (Domain → Application → Infrastructure → Interface)
- **Tests** : Couverture complète requise
- **Supabase** : Utilisation de supabase-js (pas d'ORM)
- **JWT** : Validation via Supabase Auth
- **Modularité** : Un module = un domaine métier

---

**Status :** Module Auth complété ✅ | Prêt pour le module Users 🚀