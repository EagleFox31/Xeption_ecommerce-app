/**
 * Tests unitaires pour CreateBackorderRequestUseCase
 */

import { Test, TestingModule } from "@nestjs/testing";
import { CreateBackorderRequestUseCase } from "../../application/backorder/create-backorder-request.use-case";
import {
  BackorderRepository,
  ProductStockService,
} from "../../domain/backorder/backorder.port";
import {
  BackorderStatus,
  BackorderPriority,
} from "../../domain/backorder/backorder.entity";

describe("CreateBackorderRequestUseCase", () => {
  let useCase: CreateBackorderRequestUseCase;
  let mockBackorderRepository: jest.Mocked<BackorderRepository>;
  let mockProductStockService: jest.Mocked<ProductStockService>;

  const mockBackorderRequest = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    userId: "user-123",
    productId: "product-456",
    quantity: 2,
    maxPrice: 1000,
    priority: BackorderPriority.MEDIUM,
    status: BackorderStatus.PENDING,
    notificationPreferences: {
      email: true,
      sms: false,
      push: true,
    },
    expectedDeliveryDate: new Date("2024-02-01"),
    notes: "Test notes",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepository = {
      createBackorderRequest: jest.fn(),
      getUserBackorderRequests: jest.fn(),
      getBackorderRequestById: jest.fn(),
      updateBackorderRequest: jest.fn(),
      deleteBackorderRequest: jest.fn(),
      createNotification: jest.fn(),
      getNotificationsByBackorderRequest: jest.fn(),
      checkProductAvailability: jest.fn(),
      getBackorderRequestsByProduct: jest.fn(),
      getBackorderSummary: jest.fn(),
      getExpiredBackorderRequests: jest.fn(),
    };

    const mockStockService = {
      checkStockLevel: jest.fn(),
      getExpectedRestockDate: jest.fn(),
      subscribeToStockUpdates: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateBackorderRequestUseCase,
        {
          provide: BackorderRepository,
          useValue: mockRepository,
        },
        {
          provide: ProductStockService,
          useValue: mockStockService,
        },
      ],
    }).compile();

    useCase = module.get<CreateBackorderRequestUseCase>(
      CreateBackorderRequestUseCase,
    );
    mockBackorderRepository = module.get(BackorderRepository);
    mockProductStockService = module.get(ProductStockService);
  });

  describe("execute", () => {
    const validInput = {
      userId: "user-123",
      productId: "product-456",
      quantity: 2,
      maxPrice: 1000,
      priority: BackorderPriority.MEDIUM,
      notificationPreferences: {
        email: true,
        sms: false,
        push: true,
      },
      notes: "Test notes",
    };

    it("devrait créer une demande de précommande avec succès", async () => {
      // Arrange
      mockProductStockService.checkStockLevel.mockResolvedValue(0);
      mockProductStockService.getExpectedRestockDate.mockResolvedValue(
        new Date("2024-02-01"),
      );
      mockProductStockService.subscribeToStockUpdates.mockResolvedValue(
        undefined,
      );
      mockBackorderRepository.getUserBackorderRequests.mockResolvedValue([]);
      mockBackorderRepository.createBackorderRequest.mockResolvedValue(
        mockBackorderRequest,
      );

      // Act
      const result = await useCase.execute(validInput);

      // Assert
      expect(result).toEqual(mockBackorderRequest);
      expect(mockProductStockService.checkStockLevel).toHaveBeenCalledWith(
        "product-456",
      );
      expect(
        mockBackorderRepository.getUserBackorderRequests,
      ).toHaveBeenCalledWith("user-123", {
        productId: "product-456",
        status: BackorderStatus.PENDING,
      });
      expect(
        mockBackorderRepository.createBackorderRequest,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-123",
          productId: "product-456",
          quantity: 2,
          status: BackorderStatus.PENDING,
        }),
      );
    });

    it("devrait rejeter si le produit est en stock", async () => {
      // Arrange
      mockProductStockService.checkStockLevel.mockResolvedValue(5);

      // Act & Assert
      await expect(useCase.execute(validInput)).rejects.toThrow(
        "Le produit est actuellement en stock. Aucune précommande nécessaire.",
      );
    });

    it("devrait rejeter si une demande similaire existe déjà", async () => {
      // Arrange
      mockProductStockService.checkStockLevel.mockResolvedValue(0);
      mockBackorderRepository.getUserBackorderRequests.mockResolvedValue([
        mockBackorderRequest,
      ]);

      // Act & Assert
      await expect(useCase.execute(validInput)).rejects.toThrow(
        "Une demande de précommande existe déjà pour ce produit.",
      );
    });

    it("devrait rejeter avec des données d'entrée invalides", async () => {
      // Act & Assert
      await expect(
        useCase.execute({
          ...validInput,
          userId: "",
        }),
      ).rejects.toThrow("UserId et ProductId sont requis.");

      await expect(
        useCase.execute({
          ...validInput,
          quantity: 0,
        }),
      ).rejects.toThrow("La quantité doit être supérieure à 0.");

      await expect(
        useCase.execute({
          ...validInput,
          maxPrice: -100,
        }),
      ).rejects.toThrow("Le prix maximum doit être supérieur à 0.");

      await expect(
        useCase.execute({
          ...validInput,
          notificationPreferences: {
            email: false,
            sms: false,
            push: false,
          },
        }),
      ).rejects.toThrow(
        "Au moins une méthode de notification doit être activée.",
      );
    });
  });
});
