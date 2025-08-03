# Xeption Network Backend - Makefile
# Architecture Hexagonale avec NestJS et Supabase

.PHONY: help install dev build test clean lint format setup info
.PHONY: module-users module-catalog module-cartorder module-delivery
.PHONY: module-tradein module-advisory module-backorder module-repair
.PHONY: module-rfq module-marketing

# Variables
NODE_ENV ?= development
PORT ?= 3000
APP_NAME = xeption-backend

# 🎯 Aide principale
help:
	@echo "🚀 Xeption Network Backend - Architecture Hexagonale"
	@echo "═══════════════════════════════════════════════════════"
	@echo ""
	@echo "📦 Installation & Setup:"
	@echo "  make install       - Installer les dépendances"
	@echo "  make setup         - Configuration initiale complète"
	@echo "  make info          - Informations du projet"
	@echo ""
	@echo "🔧 Développement:"
	@echo "  make dev           - Démarrer en mode développement"
	@echo "  make build         - Construire l'application"
	@echo "  make start         - Démarrer en mode production"
	@echo ""
	@echo "🧪 Tests & Qualité:"
	@echo "  make test          - Exécuter tous les tests"
	@echo "  make test-watch    - Tests en mode watch"
	@echo "  make test-cov      - Tests avec couverture"
	@echo "  make test-e2e      - Tests end-to-end"
	@echo "  make lint          - Vérifier le code (ESLint)"
	@echo "  make format        - Formater le code (Prettier)"
	@echo ""
	@echo "🏗️  Génération de Modules:"
	@echo "  make module-users      - Générer module Users"
	@echo "  make module-catalog    - Générer module Catalog"
	@echo "  make module-cartorder  - Générer module CartOrder"
	@echo "  make module-delivery   - Générer module Delivery"
	@echo "  make module-tradein    - Générer module TradeIn"
	@echo "  make module-advisory   - Générer module Advisory"
	@echo "  make module-backorder  - Générer module BackOrder"
	@echo "  make module-repair     - Générer module Repair"
	@echo "  make module-rfq        - Générer module RFQ"
	@echo "  make module-marketing  - Générer module Marketing"
	@echo ""
	@echo "🧹 Maintenance:"
	@echo "  make clean         - Nettoyer les fichiers générés"
	@echo "  make deps-check    - Vérifier les dépendances"
	@echo "  make deps-update   - Mettre à jour les dépendances"

# 📦 Installation
install:
	@echo "📦 Installation des dépendances NestJS..."
	npm install
	@echo "✅ Dépendances installées avec succès"

# ⚙️ Configuration initiale
setup: install
	@echo "⚙️  Configuration initiale du backend..."
	@echo "📋 Vérification de la structure..."
	@ls -la src/ || echo "❌ Dossier src/ manquant"
	@echo "📝 Configuration des variables d'environnement:"
	@echo "   1. Éditez le fichier .env"
	@echo "   2. Ajoutez vos clés Supabase"
	@echo "   3. Configurez JWT_SECRET"
	@echo "✅ Backend configuré avec architecture hexagonale"

# 🔧 Développement
dev:
	@echo "🔧 Démarrage en mode développement..."
	@echo "🌐 Serveur disponible sur http://localhost:$(PORT)"
	npm run start:dev

# 🏗️ Build
build:
	@echo "🏗️  Construction de l'application..."
	npm run build
	@echo "✅ Application construite dans dist/"

# 🚀 Production
start: build
	@echo "🚀 Démarrage en mode production..."
	npm run start:prod

deploy-prod:
	@echo "🚀 Déploiement en production..."
	npm run deploy:prod

deploy-staging:
	@echo "🚀 Déploiement en staging..."
	npm run deploy:staging

# 🧪 Tests
test:
	@echo "🧪 Exécution des tests unitaires..."
	npm run test

test-watch:
	@echo "👀 Tests en mode watch..."
	npm run test:watch

test-cov:
	@echo "📊 Tests avec couverture de code..."
	npm run test:cov
	@echo "📈 Rapport de couverture généré dans coverage/"

test-e2e:
	@echo "🔄 Tests end-to-end..."
	npm run test:e2e

# 🔍 Qualité du code
lint:
	@echo "🔍 Vérification du code avec ESLint..."
	npm run lint

format:
	@echo "✨ Formatage du code avec Prettier..."
	npm run format

# 🏗️ Génération de modules (Architecture Hexagonale)

# Module Users - Profil utilisateur enrichi + adresses
module-users:
	@echo "👥 Génération du module Users..."
	@echo "📁 Structure: domain/users + application/users + infrastructure/supabase + modules/users"
	@echo "🎯 Fonctionnalités: Profil enrichi, adresses, préférences"
	@echo "⚠️  TODO: Implémenter la génération automatique"

# Module Catalog - Produits, specs, filtres
module-catalog:
	@echo "📦 Génération du module Catalog..."
	@echo "📁 Structure: domain/catalog + application/catalog + infrastructure/supabase + modules/catalog"
	@echo "🎯 Fonctionnalités: Produits, spécifications, filtres, recherche"
	@echo "⚠️  TODO: Implémenter la génération automatique"

# Module CartOrder - Panier, commande, paiement
module-cartorder:
	@echo "🛒 Génération du module CartOrder..."
	@echo "📁 Structure: domain/cartorder + application/cartorder + infrastructure/supabase + modules/cartorder"
	@echo "🎯 Fonctionnalités: Panier, commandes, paiement, historique"
	@echo "⚠️  TODO: Implémenter la génération automatique"

# Module Delivery - Calcul frais livraison Cameroun
module-delivery:
	@echo "🚚 Génération du module Delivery..."
	@echo "📁 Structure: domain/delivery + application/delivery + infrastructure/supabase + modules/delivery"
	@echo "🎯 Fonctionnalités: Calcul frais livraison 237 (région, ville, commune)"
	@echo "⚠️  TODO: Implémenter la génération automatique"

# Module TradeIn - Reprise produits
module-tradein:
	@echo "🔄 Génération du module TradeIn..."
	@echo "📁 Structure: domain/tradein + application/tradein + infrastructure/supabase + modules/tradein"
	@echo "🎯 Fonctionnalités: Demande de reprise, évaluation, processus"
	@echo "⚠️  TODO: Implémenter la génération automatique"

# Module Advisory - Conseil d'achat par budget
module-advisory:
	@echo "💡 Génération du module Advisory..."
	@echo "📁 Structure: domain/advisory + application/advisory + infrastructure/supabase + modules/advisory"
	@echo "🎯 Fonctionnalités: Conseil d'achat par budget, recommandations"
	@echo "⚠️  TODO: Implémenter la génération automatique"

# Module BackOrder - Précommandes
module-backorder:
	@echo "📋 Génération du module BackOrder..."
	@echo "📁 Structure: domain/backorder + application/backorder + infrastructure/supabase + modules/backorder"
	@echo "🎯 Fonctionnalités: Précommande produits hors stock"
	@echo "⚠️  TODO: Implémenter la génération automatique"

# Module Repair - Réparations et techniciens
module-repair:
	@echo "🔧 Génération du module Repair..."
	@echo "📁 Structure: domain/repair + application/repair + infrastructure/supabase + modules/repair"
	@echo "🎯 Fonctionnalités: Réparations, techniciens, planning"
	@echo "⚠️  TODO: Implémenter la génération automatique"

# Module RFQ - Devis entreprises
module-rfq:
	@echo "📊 Génération du module RFQ..."
	@echo "📁 Structure: domain/rfq + application/rfq + infrastructure/supabase + modules/rfq"
	@echo "🎯 Fonctionnalités: Devis pour entreprises, B2B"
	@echo "⚠️  TODO: Implémenter la génération automatique"

# Module Marketing - Bannières localisées
module-marketing:
	@echo "📢 Génération du module Marketing..."
	@echo "📁 Structure: domain/marketing + application/marketing + infrastructure/supabase + modules/marketing"
	@echo "🎯 Fonctionnalités: Bannières localisées 237, campagnes"
	@echo "⚠️  TODO: Implémenter la génération automatique"

# 🧹 Maintenance
clean:
	@echo "🧹 Nettoyage des fichiers générés..."
	rm -rf dist/
	rm -rf node_modules/
	rm -rf coverage/
	@echo "✅ Nettoyage terminé"

clean-cache:
	@echo "🧹 Nettoyage du cache npm..."
	npm cache clean --force

deps-check:
	@echo "🔍 Vérification des dépendances..."
	npm audit
	npm outdated

deps-update:
	@echo "⬆️  Mise à jour des dépendances..."
	npm update

# ℹ️ Informations
info:
	@echo "ℹ️  Informations du projet $(APP_NAME)"
	@echo "═══════════════════════════════════════"
	@echo "🏗️  Architecture: Hexagonale (Ports & Adaptateurs)"
	@echo "🚀 Framework: NestJS v11"
	@echo "🔐 Auth: Supabase JWT"
	@echo "🗄️  Database: PostgreSQL via Supabase"
	@echo "🌐 Port: $(PORT)"
	@echo "🔧 Env: $(NODE_ENV)"
	@echo ""
	@echo "📊 État des modules:"
	@echo "  ✅ auth       - AuthGuard JWT + @CurrentUser() (100%)"
	@echo "  🔄 users      - Profil enrichi + adresses (0%)"
	@echo "  🔄 catalog    - Produits, specs, filtres (0%)"
	@echo "  🔄 cartorder  - Panier, commande, paiement (0%)"
	@echo "  🔄 delivery   - Calcul frais livraison 237 (0%)"
	@echo "  🔄 tradein    - Reprise produit (0%)"
	@echo "  🔄 advisory   - Conseil d'achat par budget (0%)"
	@echo "  🔄 backorder  - Précommande hors stock (0%)"
	@echo "  🔄 repair     - Réparation, techniciens (0%)"
	@echo "  🔄 rfq        - Devis entreprises (0%)"
	@echo "  🔄 marketing  - Bannières localisées 237 (0%)"
	@echo ""
	@echo "🎯 Prochaine étape: make module-users"

# 🔄 Restart dev server
restart:
	@echo "🔄 Redémarrage du serveur de développement..."
	@pkill -f "nest start" || true
	@sleep 2
	make dev

# 📝 Logs
logs:
	@echo "📝 Affichage des logs..."
	tail -f logs/*.log 2>/dev/null || echo "Aucun fichier de log trouvé"

# 🎯 Commande par défaut
.DEFAULT_GOAL := help