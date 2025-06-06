/**
 * Tests unitaires pour BackorderController
 */

import { Test, TestingModule } from "@nestjs/testing";
import { BackorderController } from "../../modules/backorder/backorder.controller";
import { BackorderService } from "../../modules/backorder/backorder.service";
import { AuthGuard } from "../../common/auth/auth.guard";
import {
  BackorderStatus,
  BackorderPriority,
} from "../../domain/backorder/backorder.entity";
import {
  CreateBackorderRequestDto,
  UpdateBackorderRequestDto,
  CancelBackorderRequestDto,
  BackorderRequestFiltersDto,
} from "../../modules/backorder/dto/backorder.dto";

describe("BackorderController", () => {
  let controller: BackorderController;
  let mockBackorderService: jest.Mocked<BackorderService>;

  const mockBackorderResponse = {
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
    expectedDeliveryDate: "2024-02-01T00:00:00.000Z",
    notes: "Test notes",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };

  beforeEach(async () => {
    const mockService = {
      createBackorderRequest: jest.fn(),
      getBackorderRequest: jest.fn(),
      getUserBackorderRequests: jest.fn(),
      updateBackorderRequest: jest.fn(),
      cancelBackorderRequest: jest.fn(),
      getBackorderSummary: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BackorderController],
      providers: [
        {
          provide: BackorderService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<BackorderController>(BackorderController);
    mockBackorderService = module.get(BackorderService);
  });

  describe("createBackorderRequest", () => {
    it("devrait créer une demande de précommande", async () => {
      // Arrange
      const createDto: CreateBackorderRequestDto = {
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

      mockBackorderService.createBackorderRequest.mockResolvedValue(
        mockBackorderResponse,
      );

      // Act
      const result = await controller.createBackorderRequest(
        "user-123",
        createDto,
      );

      // Assert
      expect(result).toEqual(mockBackorderResponse);
      expect(mockBackorderService.createBackorderRequest).toHaveBeenCalledWith(
        "user-123",
        createDto,
      );
    });
  });

  describe("getUserBackorderRequests", () => {
    it("devrait récupérer les demandes de l'utilisateur", async () => {
      // Arrange
      const filters: BackorderRequestFiltersDto = {
        status: BackorderStatus.PENDING,
        limit: 10,
        offset: 0,
      };

      const mockResponse = {
        requests: [mockBackorderResponse],
        total: 1,
        hasMore: false,
      };

      mockBackorderService.getUserBackorderRequests.mockResolvedValue(
        mockResponse,
      );

      // Act
      const result = await controller.getUserBackorderRequests(
        "user-123",
        filters,
      );

      // Assert
      expect(result).toEqual(mockResponse);
      expect(
        mockBackorderService.getUserBackorderRequests,
      ).toHaveBeenCalledWith("user-123", filters);
    });
  });

  describe("getBackorderRequest", () => {
    it("devrait récupérer une demande spécifique", async () => {
      // Arrange
      mockBackorderService.getBackorderRequest.mockResolvedValue(
        mockBackorderResponse,
      );

      // Act
      const result = await controller.getBackorderRequest(
        "user-123",
        "request-123",
      );

      // Assert
      expect(result).toEqual(mockBackorderResponse);
      expect(mockBackorderService.getBackorderRequest).toHaveBeenCalledWith(
        "request-123",
        "user-123",
      );
    });
  });

  describe("updateBackorderRequest", () => {
    it("devrait mettre à jour une demande", async () => {
      // Arrange
      const updateDto: UpdateBackorderRequestDto = {
        quantity: 3,
        priority: BackorderPriority.HIGH,
      };

      const updatedResponse = {
        ...mockBackorderResponse,
        quantity: 3,
        priority: BackorderPriority.HIGH,
      };

      mockBackorderService.updateBackorderRequest.mockResolvedValue(
        updatedResponse,
      );

      // Act
      const result = await controller.updateBackorderRequest(
        "user-123",
        "request-123",
        updateDto,
      );

      // Assert
      expect(result).toEqual(updatedResponse);
      expect(mockBackorderService.updateBackorderRequest).toHaveBeenCalledWith(
        "request-123",
        "user-123",
        updateDto,
      );
    });
  });

  describe("cancelBackorderRequest", () => {
    it("devrait annuler une demande", async () => {
      // Arrange
      const cancelDto: CancelBackorderRequestDto = {
        reason: "Plus besoin du produit",
      };

      const cancelledResponse = {
        ...mockBackorderResponse,
        status: BackorderStatus.CANCELLED,
      };

      mockBackorderService.cancelBackorderRequest.mockResolvedValue(
        cancelledResponse,
      );

      // Act
      const result = await controller.cancelBackorderRequest(
        "user-123",
        "request-123",
        cancelDto,
      );

      // Assert
      expect(result).toEqual(cancelledResponse);
      expect(mockBackorderService.cancelBackorderRequest).toHaveBeenCalledWith(
        "request-123",
        "user-123",
        cancelDto,
      );
    });
  });

  describe("getBackorderSummary", () => {
    it("devrait récupérer le résumé des précommandes", async () => {
      // Arrange
      const mockSummary = {
        totalRequests: 5,
        pendingRequests: 3,
        fulfilledRequests: 2,
        averageWaitTime: 14,
        topRequestedProducts: [
          { productId: "product-1", requestCount: 3 },
          { productId: "product-2", requestCount: 2 },
        ],
      };

      mockBackorderService.getBackorderSummary.mockResolvedValue(mockSummary);

      // Act
      const result = await controller.getBackorderSummary("user-123");

      // Assert
      expect(result).toEqual(mockSummary);
      expect(mockBackorderService.getBackorderSummary).toHaveBeenCalledWith(
        "user-123",
      );
    });
  });
});
