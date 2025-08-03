# Tests pour Xeption Network Backend

Ce répertoire contient les tests pour le backend de l'application e-commerce Xeption Network.

## Structure des tests

```
backend/src/test/
├── advisory/              # Tests pour le module Advisory
├── auth/                  # Tests pour le module Auth
├── backorder/             # Tests pour le module BackOrder
├── cartorder/             # Tests pour le module CartOrder
├── catalog/               # Tests pour le module Catalog
├── delivery/              # Tests pour le module Delivery
├── examples/              # Exemples de tests
│   ├── integration.e2e-spec.ts    # Exemple de test d'intégration
│   └── unit-test.example.spec.ts  # Exemple de test unitaire
├── marketing/             # Tests pour le module Marketing
├── rfq/                   # Tests pour le module RFQ
├── tradein/               # Tests pour le module TradeIn
└── users/                 # Tests pour le module Users
```

## Types de tests

### Tests unitaires

Les tests unitaires vérifient le comportement des composants individuels de l'application, comme les services, les contrôleurs, les repositories, et les use cases. Ils sont situés dans les sous-répertoires correspondant à chaque module et portent l'extension `.spec.ts`.

Exemple:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { CreateCartUseCase } from '../../application/cartorder/create-cart.use-case';
import { CartOrderRepository, CART_ORDER_REPOSITORY } from '../../domain/cartorder/cartorder.port';
import { CartStatus } from '../../domain/cartorder/cart.entity';

describe('CreateCartUseCase', () => {
  let useCase: CreateCartUseCase;
  let repository: CartOrderRepository;

  beforeEach(async () => {
    // Configuration du module de test...
  });

  it('devrait retourner un panier existant si actif', async () => {
    // Arrange, Act, Assert...
  });
});
```

### Tests d'intégration (E2E)

Les tests d'intégration vérifient que les différents composants de l'application fonctionnent correctement ensemble. Ils sont situés dans le répertoire `backend/test` et portent l'extension `.e2e-spec.ts`.

Ces tests utilisent une base de données PostgreSQL réelle (de test) et simulent des requêtes HTTP complètes.

Exemple:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';

describe('CartOrderController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Configuration de l'application de test...
  });

  it('devrait retourner le panier de l\'utilisateur courant', async () => {
    // Arrange, Act, Assert...
  });
});
```

## Exécution des tests

### Tests unitaires

```bash
npm test                  # Exécuter tous les tests unitaires
npm run test:watch        # Exécuter les tests en mode watch
npm run test:cov          # Générer un rapport de couverture
```

### Tests d'intégration

```bash
npm run test:e2e          # Exécuter tous les tests d'intégration
```

### Tous les tests

```bash
npm run test:all          # Exécuter les tests unitaires et d'intégration
```

Ou utiliser le script bash:

```bash
bash scripts/run-tests.sh  # Exécuter tous les tests avec un formatage amélioré
```

## Bonnes pratiques

1. **Nommage**: Utilisez des noms descriptifs pour vos tests qui expliquent clairement ce qui est testé.
2. **Pattern AAA**: Suivez le pattern Arrange-Act-Assert pour structurer vos tests.
3. **Isolation**: Chaque test doit être indépendant et ne pas dépendre d'autres tests.
4. **Mock des dépendances**: Utilisez des mocks pour isoler le code testé de ses dépendances.
5. **Couverture**: Visez une couverture de code d'au moins 80% pour les composants critiques.
6. **Nettoyer**: Nettoyez la base de données après chaque test pour éviter les interférences.

## Intégration continue

Les tests sont automatiquement exécutés lors des workflows GitHub Actions:

1. Tests unitaires et d'intégration sont exécutés pour chaque pull request
2. Les rapports de couverture sont générés et téléchargés vers Codecov
3. Les builds ne sont autorisés que si tous les tests passent