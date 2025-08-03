// Configuration pour les tests E2E
// Ce fichier est exécuté avant les tests d'intégration

// Définir un timeout global plus élevé pour les tests d'intégration
jest.setTimeout(30000);

// Variables d'environnement pour les tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.PORT = '3001';

// Helper pour nettoyer les mocks après chaque test
afterEach(() => {
  jest.clearAllMocks();
});

// Réduire le bruit dans les logs pendant les tests
console.log = jest.fn();
console.error = jest.fn();
console.warn = jest.fn();

// Restaurer les fonctions de console originales après tous les tests
afterAll(() => {
  // Restaurer console.log et autres
  jest.restoreAllMocks();
});

// Message d'information au démarrage des tests
console.info('🧪 Configuration des tests E2E chargée');