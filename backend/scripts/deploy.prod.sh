#!/bin/bash

echo "🚀 Déploiement en production..."

# 1. Sauvegarde de la base de données
npm run db:backup

# 2. Construction de l'application
npm run build:prod

# 3. Application des migrations
npm run db:migrate:prod

# 4. Redémarrage du service (via PM2 ou systemd)
pm2 restart xeption-backend || echo "❌ Erreur lors du redémarrage"

echo "✅ Déploiement terminé"