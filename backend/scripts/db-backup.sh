#!/bin/bash

# Script de sauvegarde de la base de données PostgreSQL pour Xeption
# Utilise pg_dump pour créer une sauvegarde complète de la base de données

# Configuration
DB_NAME="xeption"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/xeption_backup_${TIMESTAMP}.sql"

# Créer le répertoire de sauvegarde s'il n'existe pas
mkdir -p $BACKUP_DIR

echo "🔄 Création d'une sauvegarde de la base de données ${DB_NAME}..."

# Exécuter pg_dump pour créer la sauvegarde
# Note: Utilise les variables d'environnement PGUSER, PGPASSWORD, PGHOST si définies
pg_dump -Fc $DB_NAME > $BACKUP_FILE

# Vérifier si la sauvegarde a réussi
if [ $? -eq 0 ]; then
    echo "✅ Sauvegarde créée avec succès: ${BACKUP_FILE}"
    
    # Conserver uniquement les 5 dernières sauvegardes
    echo "🧹 Nettoyage des anciennes sauvegardes..."
    ls -t ${BACKUP_DIR}/xeption_backup_*.sql | tail -n +6 | xargs -r rm
    
    echo "📊 Espace disque utilisé par les sauvegardes:"
    du -sh $BACKUP_DIR
else
    echo "❌ Erreur lors de la création de la sauvegarde"
    exit 1
fi