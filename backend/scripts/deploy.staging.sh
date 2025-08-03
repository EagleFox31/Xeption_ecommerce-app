#!/bin/bash

echo "🚀 Déploiement en environnement de staging..."

# 1. Sauvegarde de la base de données
npm run db:backup

# 2. Construction de l'application
npm run build

# 3. Application des migrations
npm run db:migrate:deploy

# 4. Redémarrage du service (via PM2 ou systemd)
pm2 restart xeption-backend-staging || echo "❌ Erreur lors du redémarrage"

echo "✅ Déploiement en staging terminé"