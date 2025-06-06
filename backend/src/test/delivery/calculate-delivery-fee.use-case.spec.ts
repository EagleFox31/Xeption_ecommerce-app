/**
 * Tests unitaires pour CalculateDeliveryFeeUseCase
 */

import { Test, TestingModule } from "@nestjs/testing";
import { CalculateDeliveryFeeUseCase } from "../../application/delivery/calculate-delivery-fee.use-case";
import { DeliveryRepositoryPort } from "../../domain/delivery/delivery.port";
import {
  DeliveryRequest,
  DeliveryZone,
  DeliveryCost,
} from "../../domain/delivery/delivery.entity";

describe("CalculateDeliveryFeeUseCase", () => {
  let useCase: CalculateDeliveryFeeUseCase;
  let deliveryRepository: jest.Mocked<DeliveryRepositoryPort>;

  const mockDeliveryRepository = {
    findZoneByLocation: jest.fn(),
    getCostByZoneId: jest.fn(),
    findActiveZones: jest.fn(),
    findAvailableRegions: jest.fn(),
    findCitiesByRegion: jest.fn(),
    findCommunesByCity: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalculateDeliveryFeeUseCase,
        {
          provide: DeliveryRepositoryPort,
          useValue: mockDeliveryRepository,
        },
      ],
    }).compile();

    useCase = module.get<CalculateDeliveryFeeUseCase>(
      CalculateDeliveryFeeUseCase,
    );
    deliveryRepository = module.get(DeliveryRepositoryPort);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    const mockZone: DeliveryZone = {
      id: "zone-1",
      region: "Centre",
      city: "Yaoundé",
      commune: "Mfoundi",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockCost: DeliveryCost = {
      id: "cost-1",
      zoneId: "zone-1",
      baseFee: 1000,
      weightMultiplier: 250,
      distanceMultiplier: 50,
      minFee: 500,
      maxFee: 5000,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should calculate delivery fee successfully", async () => {
      const request: DeliveryRequest = {
        region: "Centre",
        city: "Yaoundé",
        commune: "Mfoundi",
        weight: 2,
        distance: 10,
      };

      mockDeliveryRepository.findZoneByLocation.mockResolvedValue(mockZone);
      mockDeliveryRepository.getCostByZoneId.mockResolvedValue(mockCost);

      const result = await useCase.execute(request);

      expect(result).toEqual({
        zoneId: "zone-1",
        region: "Centre",
        city: "Yaoundé",
        commune: "Mfoundi",
        baseFee: 1000,
        weightFee: 250, // (2-1) * 250
        distanceFee: 250, // (10-5) * 50
        totalFee: 1500,
        estimatedDays: 1, // Yaoundé est une ville majeure
      });
    });

    it("should apply minimum fee when calculated fee is too low", async () => {
      const request: DeliveryRequest = {
        region: "Centre",
        city: "Yaoundé",
        weight: 0.5, // Très léger
        distance: 2, // Très proche
      };

      const lowCostMock = { ...mockCost, baseFee: 200 };
      mockDeliveryRepository.findZoneByLocation.mockResolvedValue(mockZone);
      mockDeliveryRepository.getCostByZoneId.mockResolvedValue(lowCostMock);

      const result = await useCase.execute(request);

      expect(result.totalFee).toBe(500); // minFee appliqué
    });

    it("should apply maximum fee when calculated fee is too high", async () => {
      const request: DeliveryRequest = {
        region: "Centre",
        city: "Yaoundé",
        weight: 50, // Très lourd
        distance: 100, // Très loin
      };

      mockDeliveryRepository.findZoneByLocation.mockResolvedValue(mockZone);
      mockDeliveryRepository.getCostByZoneId.mockResolvedValue(mockCost);

      const result = await useCase.execute(request);

      expect(result.totalFee).toBe(5000); // maxFee appliqué
    });

    it("should throw error when zone is not found", async () => {
      const request: DeliveryRequest = {
        region: "InvalidRegion",
        city: "InvalidCity",
      };

      mockDeliveryRepository.findZoneByLocation.mockResolvedValue(null);

      await expect(useCase.execute(request)).rejects.toThrow(
        "Zone de livraison non disponible pour InvalidRegion, InvalidCity",
      );
    });

    it("should throw error when zone is inactive", async () => {
      const request: DeliveryRequest = {
        region: "Centre",
        city: "Yaoundé",
      };

      const inactiveZone = { ...mockZone, isActive: false };
      mockDeliveryRepository.findZoneByLocation.mockResolvedValue(inactiveZone);

      await expect(useCase.execute(request)).rejects.toThrow(
        "Livraison temporairement indisponible pour cette zone",
      );
    });

    it("should throw error when cost is not found", async () => {
      const request: DeliveryRequest = {
        region: "Centre",
        city: "Yaoundé",
      };

      mockDeliveryRepository.findZoneByLocation.mockResolvedValue(mockZone);
      mockDeliveryRepository.getCostByZoneId.mockResolvedValue(null);

      await expect(useCase.execute(request)).rejects.toThrow(
        "Tarifs de livraison non configurés pour cette zone",
      );
    });

    it("should validate request data", async () => {
      const invalidRequest: DeliveryRequest = {
        region: "",
        city: "Yaoundé",
      };

      await expect(useCase.execute(invalidRequest)).rejects.toThrow(
        "La région est obligatoire",
      );
    });

    it("should calculate estimated days correctly for different regions", async () => {
      const request: DeliveryRequest = {
        region: "Extrême-Nord",
        city: "Maroua",
      };

      const remoteZone = {
        ...mockZone,
        region: "Extrême-Nord",
        city: "Maroua",
      };
      mockDeliveryRepository.findZoneByLocation.mockResolvedValue(remoteZone);
      mockDeliveryRepository.getCostByZoneId.mockResolvedValue(mockCost);

      const result = await useCase.execute(request);

      expect(result.estimatedDays).toBe(5); // Région éloignée
    });
  });
});
