import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '../../common/auth/auth.guard';
import { createMockConfigService, MockAuthGuard, mockCurrentUser } from '../test-utils';
import { CartOrderController } from '../../modules/cartorder/cartorder.controller';
import { CartOrderService } from '../../modules/cartorder/cartorder.service';
import { InvoiceService } from '../../modules/cartorder/invoice.service';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { AddCartItemDto, CreateCartDto } from '../../modules/cartorder/dto/cart.dto';
import { CreateOrderDto, ShippingAddressDto } from '../../modules/cartorder/dto/order.dto';

// Mocks pour les services
const mockCartOrderService = {
  createCart: jest.fn(),
  getCartByUserId: jest.fn(),
  getCartById: jest.fn(),
  addCartItem: jest.fn(),
  updateCartItem: jest.fn(),
  removeCartItem: jest.fn(),
  createOrder: jest.fn(),
  getOrdersByUserId: jest.fn(), // Correct method name used in the controller
};

// No need to define interfaces as we're importing the actual DTOs

const mockInvoiceService = {
  generateInvoice: jest.fn(),
};

describe('CartOrderController', () => {
  let controller: CartOrderController;
  let cartOrderService: CartOrderService;

  beforeEach(async () => {
    // Utilisation du mock ConfigService pour résoudre les dépendances
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartOrderController],
      providers: [
        {
          provide: CartOrderService,
          useValue: mockCartOrderService,
        },
        {
          provide: InvoiceService,
          useValue: mockInvoiceService,
        },
        {
          provide: ConfigService,
          useFactory: createMockConfigService,
        },
      ],
    })
      // Remplacer l'AuthGuard par notre implémentation de test
      .overrideGuard(AuthGuard)
      .useClass(MockAuthGuard)
      // Remplacer le décorateur CurrentUser
      .overrideProvider(CurrentUser)
      .useValue(mockCurrentUser)
      .compile();

    controller = module.get<CartOrderController>(CartOrderController);
    cartOrderService = module.get<CartOrderService>(CartOrderService);
    
    // Reset des mocks avant chaque test
    jest.clearAllMocks();
  });

  describe('Cart Operations', () => {
    it('should create a cart', async () => {
      // Arrangement
      const userId = 'test-user-id';
      const cart = { 
        id: 'cart-1', 
        userId,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockCartOrderService.createCart.mockResolvedValue(cart);

      // Action
      // Mock the user parameter that would be injected by @CurrentUser()
      const mockUser = { sub: userId, email: 'test@example.com' };
      // Mock the DTO parameter that would be injected by @Body()
      const createCartDto = {};
      
      const result = await controller.createCart(mockUser, createCartDto);

      // Assertion
      expect(cartOrderService.createCart).toHaveBeenCalledWith({ userId });
      expect(result).toBe(cart);
    });

    it('should get current user cart', async () => {
      // Arrangement
      const userId = 'test-user-id';
      const cart = { 
        id: 'cart-1', 
        userId,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockCartOrderService.getCartByUserId.mockResolvedValue(cart);

      // Action
      // Mock the user parameter that would be injected by @CurrentUser()
      const mockUser = { sub: userId, email: 'test@example.com' };
      
      const result = await controller.getCurrentCart(mockUser);

      // Assertion
      expect(cartOrderService.getCartByUserId).toHaveBeenCalledWith(userId);
      expect(result).toBe(cart);
    });

    it('should add item to cart', async () => {
      // Arrangement
      const cartItem: AddCartItemDto = {
        productId: "product-123", // Should be string per the DTO
        quantity: 2,
        unitPrice: 5000,
      };
      
      const createdCartItem = {
        ...cartItem,
        cartUserId: 'test-user-id',
      };
      
      mockCartOrderService.addCartItem.mockResolvedValue(createdCartItem);

      // Action
      // Mock the parameters that would be injected by @Param() and @Body()
      const cartId = 'cart-123';
      
      const result = await controller.addCartItem(cartId, cartItem);

      // Assertion
      expect(cartOrderService.addCartItem).toHaveBeenCalledWith({
        cartId,
        ...cartItem,
      });
      expect(result).toBe(createdCartItem);
    });
  });

  describe('Order Operations', () => {
    it('should create an order', async () => {
      // Arrangement
      const shippingAddress: ShippingAddressDto = {
        street: '123 Test Street',
        city: 'Douala',
        state: 'Littoral',
        postalCode: '237',
        country: 'Cameroon',
        phone: '+237612345678'
      };
      
      const orderData: CreateOrderDto = {
        cartId: 'cart-123',
        shippingAddress: shippingAddress,
        notes: 'Please deliver quickly'
      };
      
      const order = {
        id: 'order-1',
        userId: 'test-user-id',
        status: 'new',
        amountXaf: '20000',
        items: [],
        createdAt: new Date(),
      };
      
      mockCartOrderService.createOrder.mockResolvedValue(order);

      // Action
      // Mock the user parameter that would be injected by @CurrentUser()
      const mockUser = { sub: 'test-user-id', email: 'test@example.com' };
      
      const result = await controller.createOrder(mockUser, orderData);

      // Assertion
      expect(cartOrderService.createOrder).toHaveBeenCalledWith({
        ...orderData,
        userId: 'test-user-id',
      });
      expect(result).toBe(order);
    });

    it('should get user orders', async () => {
      // Arrangement
      const userId = 'test-user-id';
      const orders = [
        {
          id: 'order-1',
          userId,
          status: 'new',
          amountXaf: '20000',
          items: [],
          createdAt: new Date(),
        },
      ];
      
      mockCartOrderService.getOrdersByUserId.mockResolvedValue(orders);

      // Action
      // Mock the user parameter that would be injected by @CurrentUser()
      const mockUser = { sub: userId, email: 'test@example.com' };
      
      const result = await controller.getUserOrders(mockUser);

      // Assertion
      expect(cartOrderService.getOrdersByUserId).toHaveBeenCalledWith(userId);
      expect(result).toBe(orders);
    });
  });
});