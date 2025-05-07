# Architecture de l'Application Xeption Network

## Vue d'ensemble

Xeption Network est une plateforme e-commerce spécialisée dans la vente de produits technologiques au Cameroun. L'application est construite avec React et utilise Vite comme outil de build. Elle propose une interface utilisateur moderne avec un thème sombre agrémenté d'accents or, blanc et rouge, reflétant l'identité visuelle de la marque.

## Structure du Projet

```
src/
├── components/     # Composants React réutilisables
├── context/        # Contextes React pour la gestion d'état global
├── lib/            # Utilitaires et fonctions d'aide
├── pages/          # Pages principales de l'application
├── services/       # Services pour la gestion des données et API
└── stories/        # Stories pour les composants UI (documentation)
```

## Flux de Données

L'application utilise principalement des services mock pour simuler les interactions avec un backend. Les données sont stockées en mémoire et réinitialisées à chaque rechargement de l'application. Dans une version de production, ces services seraient remplacés par des appels API réels.

## Composants Principaux

### Page d'Accueil (`src/components/home.tsx`)

La page d'accueil est composée de plusieurs sections :

- **HeroSection** : Bannière principale avec appels à l'action
- **ProductCategories** : Affichage des catégories de produits
- **FeaturedProducts** : Mise en avant des produits populaires
- **ServicesSection** : Présentation des services offerts
- **BusinessSection** : Section dédiée aux clients professionnels
- **LocationSection** : Information sur l'emplacement physique

### Système de Routage (`src/App.tsx`)

L'application utilise React Router pour la navigation entre les différentes pages :

- Routes principales pour les produits et le panier
- Routes pour les services (trade-in, approvisionnement professionnel, consultation)
- Routes d'authentification (connexion, inscription)
- Routes du compte utilisateur (profil, commandes, adresses)
- Routes pour les clients professionnels

## Services Principaux

### Service d'Authentification (`src/services/auth.ts`)

Gère l'authentification des utilisateurs avec les fonctionnalités suivantes :

- `login(email, password)` : Authentifie un utilisateur
- `register(firstName, lastName, email, password, isBusinessClient, businessDetails)` : Inscrit un nouvel utilisateur
- `logout()` : Déconnecte l'utilisateur actuel
- `getCurrentUser()` : Récupère les informations de l'utilisateur connecté
- `updateUserProfile(userData)` : Met à jour le profil utilisateur
- `isAuthenticated()` : Vérifie si un utilisateur est connecté

### Service de Produits (`src/services/productService.ts`)

Gère les données des produits pour les clients professionnels :

- `getEnterpriseProducts()` : Récupère tous les produits professionnels
- `getEnterpriseProductById(id)` : Récupère un produit par son ID
- `getEnterpriseProductsByCategory(category)` : Filtre les produits par catégorie
- `getEnterpriseProductCategories()` : Récupère toutes les catégories de produits
- `filterEnterpriseProductsByAvailability(availability)` : Filtre les produits par disponibilité
- `searchEnterpriseProducts(query)` : Recherche des produits par nom ou description

### Service de Demande de Devis (`src/services/rfqService.ts`)

Gère les demandes de devis (Request For Quote) pour les clients professionnels :

- `submitRFQRequest(data)` : Soumet une nouvelle demande de devis
- `getRFQRequests()` : Récupère toutes les demandes de devis
- `getUserRFQRequests(userId)` : Récupère les demandes d'un utilisateur spécifique
- `getRFQRequestById(id)` : Récupère une demande par son ID
- `updateRFQRequestStatus(id, status)` : Met à jour le statut d'une demande

## Fonctionnalités Principales

### Catalogue de Produits

Affichage des produits avec filtrage par catégorie et par prix. Les utilisateurs peuvent parcourir les différentes catégories (ordinateurs, smartphones, accessoires, consommables) et consulter les détails des produits.

### Panier d'Achat

Permets aux utilisateurs d'ajouter des produits à leur panier et de procéder au paiement. Le processus inclut la sélection de l'adresse de livraison et du mode de paiement.

### Services de Trade-in ("Troc")

Permets aux utilisateurs d'échanger leurs anciens appareils contre des crédits ou des réductions. Le processus comprend l'évaluation de l'appareil et la programmation d'un rendez-vous pour la remise.

### Approvisionnement Professionnel

Fonctionnalité dédiée aux clients professionnels pour commander des produits en grande quantité. Les entreprises peuvent soumettre des demandes de devis (RFQ) et recevoir des propositions personnalisées.

### Commandes Spéciales

Permets aux utilisateurs de commander des produits qui ne sont pas en stock. Le système enregistre la demande et informe l'utilisateur lorsque le produit est disponible.

### Consultation Budgétaire

Service de conseil pour les utilisateurs qui ont un budget mais ne savent pas quels produits acheter. Les utilisateurs peuvent planifier une consultation avec un agent du magasin.

### Gestion de Compte

Les utilisateurs peuvent créer un compte, se connecter, gérer leur profil, consulter l'historique de leurs commandes et gérer leurs adresses de livraison.

## Contextes

### Contexte de Localisation (`src/context/LocationContext.tsx`)

Gère les informations de localisation pour adapter les options de livraison en fonction de l'emplacement de l'utilisateur au Cameroun.

## Conclusion

L'architecture de Xeption Network est conçue pour offrir une expérience utilisateur fluide et réactive, tout en permettant une extension facile pour de nouvelles fonctionnalités. La séparation claire entre les composants, les services et les pages facilite la maintenance et l'évolution de l'application.
