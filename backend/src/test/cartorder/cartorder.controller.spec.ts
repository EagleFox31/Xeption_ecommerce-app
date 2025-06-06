import { Test, TestingModule } from "@nestjs/testing";
import { CartOrderController } from "../../modules/cartorder/cartorder.controller";
import { CartOrderService } from "../../modules/cartorder/cartorder.service";
import { JwtPayload } from "../../common/auth/jwt.types";
import { CartStatus } from "../../domain/cartorder/cart.entity";
import {
  OrderStatus,
  PaymentStatus,
} from "../../domain/cartorder/order.entity";
import {
  PaymentMethod,
  PaymentProvider,
} from "../../domain/cartorder/payment.entity";

describe("CartOrderController", () => {
  let controller: CartOrderController;
  let service: CartOrderService;

  const mockUser: JwtPayload = {
    sub: "user-123",
    email: "test@example.com",
    role: "user",
  };

  const mockCart = {
    id: "cart-123",
    userId: "user-123",
    items: [],
    totalAmount: 0,
    currency: "XAF",
    status: CartStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOrder = {
    id: "order-123",
    userId: "user-123",
    orderNumber: "ORD-123",
    items: [],
    subtotal: 100,
    shippingCost: 10,
    taxAmount: 5,
    totalAmount: 115,
    currency: "XAF",
    status: OrderStatus.PENDING,
    paymentStatus: PaymentStatus.PENDING,
    shippingAddress: {
      street: "123 Test St",
      city: "Douala",
      state: "Littoral",
      postalCode: "12345",
      country: "Cameroon",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPayment = {
    id: "payment-123",
    orderId: "order-123",
    userId: "user-123",
    amount: 115,
    currency: "XAF",
    paymentMethod: PaymentMethod.MOBILE_MONEY,
    paymentProvider: PaymentProvider.MTN_MONEY,
    status: PaymentStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCartOrderService = {
    createCart: jest.fn(),
    getCartById: jest.fn(),
    getCartByUserId: jest.fn(),
    addCartItem: jest.fn(),
    updateCartItem: jest.fn(),
    removeCartItem: jest.fn(),
    clearCart: jest.fn(),
    deleteCart: jest.fn(),
    createOrder: jest.fn(),
    getOrderById: jest.fn(),
    getOrdersByUserId: jest.fn(),
    updateOrderStatus: jest.fn(),
    deleteOrder: jest.fn(),
    createPayment: jest.fn(),
    getPaymentById: jest.fn(),
    getPaymentsByOrderId: jest.fn(),
    getPaymentsByUserId: jest.fn(),
    processPayment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartOrderController],
      providers: [
        {
          provide: CartOrderService,
          useValue: mockCartOrderService,
        },
      ],
    }).compile();

    controller = module.get<CartOrderController>(CartOrderController);
    service = module.get<CartOrderService>(CartOrderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Cart Operations", () => {
    it("should create a cart", async () => {
      mockCartOrderService.createCart.mockResolvedValue(mockCart);

      const result = await controller.createCart(mockUser, {});

      expect(service.createCart).toHaveBeenCalledWith({
        userId: mockUser.sub,
      });
      expect(result).toEqual(mockCart);
    });

    it("should get current user cart", async () => {
      mockCartOrderService.getCartByUserId.mockResolvedValue(mockCart);

      const result = await controller.getCurrentCart(mockUser);

      expect(service.getCartByUserId).toHaveBeenCalledWith(mockUser.sub);
      expect(result).toEqual(mockCart);
    });

    it("should get cart by ID", async () => {
      mockCartOrderService.getCartById.mockResolvedValue(mockCart);

      const result = await controller.getCart("cart-123");

      expect(service.getCartById).toHaveBeenCalledWith("cart-123");
      expect(result).toEqual(mockCart);
    });

    it("should add item to cart", async () => {
      const addItemDto = {
        productId: "product-123",
        quantity: 2,
        unitPrice: 50,
      };
      mockCartOrderService.addCartItem.mockResolvedValue(mockCart);

      const result = await controller.addCartItem("cart-123", addItemDto);

      expect(service.addCartItem).toHaveBeenCalledWith({
        cartId: "cart-123",
        ...addItemDto,
      });
      expect(result).toEqual(mockCart);
    });
  });

  describe("Order Operations", () => {
    it("should create an order", async () => {
      const createOrderDto = {
        cartId: "cart-123",
        shippingAddress: {
          street: "123 Test St",
          city: "Douala",
          state: "Littoral",
          postalCode: "12345",
          country: "Cameroon",
        },
      };
      mockCartOrderService.createOrder.mockResolvedValue(mockOrder);

      const result = await controller.createOrder(mockUser, createOrderDto);

      expect(service.createOrder).toHaveBeenCalledWith({
        userId: mockUser.sub,
        ...createOrderDto,
      });
      expect(result).toEqual(mockOrder);
    });

    it("should get user orders", async () => {
      mockCartOrderService.getOrdersByUserId.mockResolvedValue([mockOrder]);

      const result = await controller.getUserOrders(mockUser);

      expect(service.getOrdersByUserId).toHaveBeenCalledWith(mockUser.sub);
      expect(result).toEqual([mockOrder]);
    });
  });

  describe("Payment Operations", () => {
    it("should create a payment", async () => {
      const createPaymentDto = {
        orderId: "order-123",
        amount: 115,
        currency: "XAF",
        paymentMethod: PaymentMethod.MOBILE_MONEY,
        paymentProvider: PaymentProvider.MTN_MONEY,
      };
      mockCartOrderService.createPayment.mockResolvedValue(mockPayment);

      const result = await controller.createPayment(mockUser, createPaymentDto);

      expect(service.createPayment).toHaveBeenCalledWith({
        userId: mockUser.sub,
        ...createPaymentDto,
      });
      expect(result).toEqual(mockPayment);
    });

    it("should get user payments", async () => {
      mockCartOrderService.getPaymentsByUserId.mockResolvedValue([mockPayment]);

      const result = await controller.getUserPayments(mockUser);

      expect(service.getPaymentsByUserId).toHaveBeenCalledWith(mockUser.sub);
      expect(result).toEqual([mockPayment]);
    });
  });
});
