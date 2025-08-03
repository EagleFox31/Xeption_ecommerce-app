import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CreateCartUseCase } from '../../application/cartorder/create-cart.use-case';
import { CartOrderRepository, CART_ORDER_REPOSITORY } from '../../domain/cartorder/cartorder.port';
import { CartStatus } from '../../domain/cartorder/cart.entity';

// Mock du repository
const mockCartOrderRepository = {
  getCartByUserId: jest.fn(),
  createCart: jest.fn(),
};

describe('CreateCartUseCase', () => {
  let useCase: CreateCartUseCase;
  let repository: CartOrderRepository;

  beforeEach(async () => {
    // Configuration du module de test
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCartUseCase,
        {
          provide: CART_ORDER_REPOSITORY,
          useValue: mockCartOrderRepository,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'NODE_ENV') return 'test';
              return null;
            }),
          },
        },
      ],
    }).compile();

    // Récupération des instances
    useCase = module.get<CreateCartUseCase>(CreateCartUseCase);
    repository = module.get<CartOrderRepository>(CART_ORDER_REPOSITORY);

    // Reset des mocks avant chaque test
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('devrait retourner un panier existant si actif', async () => {
      // Arrangement
      const userId = 'user-123';
      const existingCart = {
        id: 'cart-123',
        userId,
        items: [],
        status: CartStatus.ACTIVE,
        totalAmount: 0,
        currency: 'XAF',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockCartOrderRepository.getCartByUserId.mockResolvedValue(existingCart);

      // Action
      const result = await useCase.execute({ userId });

      // Assertion
      expect(repository.getCartByUserId).toHaveBeenCalledWith(userId);
      expect(repository.createCart).not.toHaveBeenCalled();
      expect(result).toBe(existingCart);
    });

    it('devrait créer un nouveau panier si aucun n\'existe', async () => {
      // Arrangement
      const userId = 'user-123';
      const newCart = {
        id: 'cart-new',
        userId,
        items: [],
        status: CartStatus.ACTIVE,
        totalAmount: 0,
        currency: 'XAF',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockCartOrderRepository.getCartByUserId.mockResolvedValue(null);
      mockCartOrderRepository.createCart.mockResolvedValue(newCart);

      // Action
      const result = await useCase.execute({ userId });

      // Assertion
      expect(repository.getCartByUserId).toHaveBeenCalledWith(userId);
      expect(repository.createCart).toHaveBeenCalledWith({ userId });
      expect(result).toBe(newCart);
    });

    it('devrait créer un nouveau panier si l\'existant n\'est pas actif', async () => {
      // Arrangement
      const userId = 'user-123';
      const existingCart = {
        id: 'cart-123',
        userId,
        items: [],
        status: CartStatus.CONVERTED,
        totalAmount: 0,
        currency: 'XAF',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const newCart = {
        id: 'cart-new',
        userId,
        items: [],
        status: CartStatus.ACTIVE,
        totalAmount: 0,
        currency: 'XAF',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockCartOrderRepository.getCartByUserId.mockResolvedValue(existingCart);
      mockCartOrderRepository.createCart.mockResolvedValue(newCart);

      // Action
      const result = await useCase.execute({ userId });

      // Assertion
      expect(repository.getCartByUserId).toHaveBeenCalledWith(userId);
      expect(repository.createCart).toHaveBeenCalledWith({ userId });
      expect(result).toBe(newCart);
    });
  });
});