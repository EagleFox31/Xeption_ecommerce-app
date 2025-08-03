import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { UserRole, PaymentMethodEnum, OrderStatusEnum } from '@prisma/client';

describe('CartOrderController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let testUserId: string;
  let testProductId: bigint;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);

    // Configuration globale de l'application identique à main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.setGlobalPrefix('api/v1');

    await app.init();

    // Nettoyer la base de données avant les tests
    await cleanDatabase();

    // Ajouter des données de test
    await seedTestData();

    // Obtenir un token d'authentification pour les tests
    authToken = await getAuthToken();
  });

  afterAll(async () => {
    // Nettoyer la base de données après les tests
    await cleanDatabase();
    await app.close();
  });

  // Fonction utilitaire pour nettoyer la base de données
  async function cleanDatabase() {
    // Dans un environnement de test, on peut vider certaines tables
    // Attention à l'ordre pour respecter les contraintes de clés étrangères
    if (process.env.NODE_ENV === 'test') {
      await prisma.$transaction([
        prisma.$executeRaw`TRUNCATE TABLE "cart_items" CASCADE;`,
        prisma.$executeRaw`TRUNCATE TABLE "carts" CASCADE;`,
        prisma.$executeRaw`TRUNCATE TABLE "order_items" CASCADE;`,
        prisma.$executeRaw`TRUNCATE TABLE "orders" CASCADE;`,
        prisma.$executeRaw`TRUNCATE TABLE "products" CASCADE;`,
        prisma.$executeRaw`TRUNCATE TABLE "categories" CASCADE;`,
        prisma.$executeRaw`TRUNCATE TABLE "users" CASCADE;`,
      ]);
    }
  }

  // Fonction utilitaire pour ajouter des données de test
  async function seedTestData() {
    // Créer un utilisateur de test
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        fullName: 'Test User',
        phone237: '+237600000000',
        role: UserRole.client,
      },
    });
    
    testUserId = user.id;
    
    // Créer une catégorie
    const category = await prisma.category.create({
      data: {
        name: 'Test Category',
        slug: 'test-category',
      },
    });
    
    // Créer un produit de test
    const product = await prisma.product.create({
      data: {
        name: 'Test Product',
        slug: 'test-product',
        categoryId: category.id,
        priceXaf: '10000',
        stockQty: 100,
      },
    });
    
    testProductId = product.id;
  }

  // Fonction utilitaire pour obtenir un token d'authentification
  async function getAuthToken(): Promise<string> {
    // Pour les tests, nous pourrions simuler l'authentification
    // ou utiliser un token fixe pour les tests
    return 'test-auth-token';
  }

  describe('/api/v1/cartorder/cart (GET)', () => {
    it('devrait retourner le panier de l\'utilisateur courant', async () => {
      // Arrange: Créer un panier pour l'utilisateur de test
      await prisma.cart.create({
        data: {
          userId: testUserId,
        },
      });

      // Act & Assert
      return request(app.getHttpServer())
        .get('/api/v1/cartorder/cart')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeDefined();
          expect(res.body.userId).toBe(testUserId);
          expect(res.body.items).toEqual([]);
        });
    });
  });

  describe('/api/v1/cartorder/cart/items (POST)', () => {
    it('devrait ajouter un article au panier', async () => {
      // Act & Assert
      return request(app.getHttpServer())
        .post('/api/v1/cartorder/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: testProductId.toString(),
          qty: 2,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toBeDefined();
          expect(res.body.id).toBeDefined();
          expect(res.body.productId).toBe(testProductId.toString());
          expect(res.body.qty).toBe(2);
        });
    });

    it('devrait rejeter une requête avec une quantité négative', async () => {
      return request(app.getHttpServer())
        .post('/api/v1/cartorder/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: testProductId.toString(),
          qty: -1,
        })
        .expect(400);
    });
  });

  describe('/api/v1/cartorder/cart/items/:itemId (PATCH)', () => {
    it('devrait mettre à jour la quantité d\'un article dans le panier', async () => {
      // Arrange: Ajouter un article au panier
      const cartItem = await prisma.cartItem.create({
        data: {
          cartUserId: testUserId,
          productId: testProductId,
          qty: 1,
        },
      });

      // Act & Assert
      return request(app.getHttpServer())
        .patch(`/api/v1/cartorder/cart/items/${cartItem.id.toString()}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          qty: 3,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeDefined();
          expect(res.body.id).toBeDefined();
          expect(res.body.qty).toBe(3);
        });
    });
  });

  describe('/api/v1/cartorder/cart/items/:itemId (DELETE)', () => {
    it('devrait supprimer un article du panier', async () => {
      // Arrange: Ajouter un article au panier
      const cartItem = await prisma.cartItem.create({
        data: {
          cartUserId: testUserId,
          productId: testProductId,
          qty: 1,
        },
      });

      // Act & Assert
      return request(app.getHttpServer())
        .delete(`/api/v1/cartorder/cart/items/${cartItem.id.toString()}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });
  });

  describe('/api/v1/cartorder/checkout (POST)', () => {
    it('devrait créer une commande à partir du panier', async () => {
      // Arrange: S'assurer qu'il y a des articles dans le panier
      await prisma.cartItem.create({
        data: {
          cartUserId: testUserId,
          productId: testProductId,
          qty: 2,
        },
      });

      // Act & Assert
      return request(app.getHttpServer())
        .post('/api/v1/cartorder/checkout')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          deliveryMethod: 'standard',
          paymentMethod: PaymentMethodEnum.momo,
          phoneNumber: '+237600000000',
          shippingAddress: {
            country: 'Cameroon',
            addressLine: '123 Test Street, Douala',
          }
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toBeDefined();
          expect(res.body.id).toBeDefined();
          expect(res.body.status).toBe(OrderStatusEnum.new);
          expect(res.body.userId).toBe(testUserId);
          expect(res.body.paymentMethod).toBe(PaymentMethodEnum.momo);
          expect(res.body.items).toBeDefined();
          expect(res.body.items.length).toBeGreaterThan(0);
        });
    });
  });

  describe('/api/v1/cartorder/orders (GET)', () => {
    it('devrait lister les commandes de l\'utilisateur', async () => {
      // Arrange: Créer une adresse de livraison
      const address = await prisma.address.create({
        data: {
          userId: testUserId,
          addressLine: '123 Test Street',
          country: 'Cameroon',
        },
      });

      // Créer une commande
      await prisma.order.create({
        data: {
          userId: testUserId,
          amountXaf: '20000',
          paymentMethod: PaymentMethodEnum.momo,
          deliveryMethod: 'standard',
          deliveryAddressId: address.id,
          status: OrderStatusEnum.new,
          items: {
            create: [
              {
                productId: testProductId,
                qty: 2,
                unitPriceXaf: '10000',
              },
            ],
          },
        },
      });

      // Act & Assert
      return request(app.getHttpServer())
        .get('/api/v1/cartorder/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeDefined();
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0].userId).toBe(testUserId);
          expect(res.body[0].status).toBe(OrderStatusEnum.new);
        });
    });
  });

  describe('/api/v1/cartorder/orders/:id (GET)', () => {
    it('devrait retourner les détails d\'une commande', async () => {
      // Arrange: Créer une adresse de livraison
      const address = await prisma.address.create({
        data: {
          userId: testUserId,
          addressLine: '123 Test Street',
          country: 'Cameroon',
        },
      });

      // Créer une commande
      const order = await prisma.order.create({
        data: {
          userId: testUserId,
          amountXaf: '20000',
          paymentMethod: PaymentMethodEnum.momo,
          deliveryMethod: 'standard',
          deliveryAddressId: address.id,
          status: OrderStatusEnum.new,
          items: {
            create: [
              {
                productId: testProductId,
                qty: 2,
                unitPriceXaf: '10000',
              },
            ],
          },
        },
        include: {
          items: true,
        },
      });

      // Act & Assert
      return request(app.getHttpServer())
        .get(`/api/v1/cartorder/orders/${order.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeDefined();
          expect(res.body.id).toBe(order.id);
          expect(res.body.userId).toBe(testUserId);
          expect(res.body.status).toBe(OrderStatusEnum.new);
          expect(res.body.items).toBeDefined();
          expect(res.body.items.length).toBe(1);
        });
    });
  });
});
