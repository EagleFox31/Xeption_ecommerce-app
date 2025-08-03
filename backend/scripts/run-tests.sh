#!/bin/bash
# Script pour exécuter les tests unitaires et d'intégration

# Couleurs pour une meilleure lisibilité
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Démarrage des tests pour Xeption Network E-Commerce Backend ===${NC}\n"

# Vérifier si le serveur de base de données est accessible
echo -e "${YELLOW}Vérification de la connexion à PostgreSQL...${NC}"
if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Base de données PostgreSQL accessible${NC}"
else
  echo -e "${RED}✗ Impossible de se connecter à PostgreSQL${NC}"
  echo -e "${YELLOW}Veuillez démarrer PostgreSQL avant d'exécuter les tests.${NC}"
  exit 1
fi

# Générer le client Prisma si nécessaire
echo -e "\n${YELLOW}Génération du client Prisma...${NC}"
npx prisma generate
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Client Prisma généré avec succès${NC}"
else
  echo -e "${RED}✗ Erreur lors de la génération du client Prisma${NC}"
  exit 1
fi

# Exécuter les tests unitaires
echo -e "\n${YELLOW}Exécution des tests unitaires...${NC}"
npm test
UNIT_RESULT=$?

# Exécuter les tests d'intégration
echo -e "\n${YELLOW}Exécution des tests d'intégration...${NC}"
npm run test:e2e
E2E_RESULT=$?

# Afficher un résumé
echo -e "\n${YELLOW}=== Résumé des tests ===${NC}"
if [ $UNIT_RESULT -eq 0 ]; then
  echo -e "${GREEN}✓ Tests unitaires : SUCCÈS${NC}"
else
  echo -e "${RED}✗ Tests unitaires : ÉCHEC${NC}"
fi

if [ $E2E_RESULT -eq 0 ]; then
  echo -e "${GREEN}✓ Tests d'intégration : SUCCÈS${NC}"
else
  echo -e "${RED}✗ Tests d'intégration : ÉCHEC${NC}"
fi

# Vérifier si tous les tests ont réussi
if [ $UNIT_RESULT -eq 0 ] && [ $E2E_RESULT -eq 0 ]; then
  echo -e "\n${GREEN}=== Tous les tests ont réussi! ===${NC}"
  exit 0
else
  echo -e "\n${RED}=== Des tests ont échoué. Veuillez corriger les erreurs. ===${NC}"
  exit 1
fi