/**
 * Tests unitaires pour DeliveryController
 */

import { Test, TestingModule } from "@nestjs/testing";
import { DeliveryController } from "../../modules/delivery/delivery.controller";
import { DeliveryService } from "../../modules/delivery/delivery.service";
import { AuthGuard } from "../../common/auth/auth.guard";
import { ConfigService } from "@nestjs/config";
import {
  CalculateDeliveryFeeDto,
  CheckDeliveryAvailabilityDto,
} from "../../modules/delivery/dto/delivery.dto";

describe("DeliveryController", () => {
  let controller: DeliveryController;
  let deliveryService: jest.Mocked<DeliveryService>;

  const mockDeliveryService = {
    calculateDeliveryFee: jest.fn(),
    isDeliveryAvailable: jest.fn(),
    getAvailableZones: jest.fn(),
    getAvailableRegions: jest.fn(),
    getCitiesByRegion: jest.fn(),
    getCommunesByCity: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      const config = {
        SUPABASE_URL: "https://test.supabase.co",
        SUPABASE_SERVICE_KEY: "test-service-key",
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveryController],
      providers: [
        {
          provide: DeliveryService,
          useValue: mockDeliveryService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<DeliveryController>(DeliveryController);
    deliveryService = module.get(DeliveryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("calculateDeliveryFee", () => {
    it("should calculate delivery fee successfully", async () => {
      const dto: CalculateDeliveryFeeDto = {
        region: "Centre",
        city: "Yaoundé",
        commune: "Mfoundi",
        weight: 2,
        distance: 10,
      };

      const expectedResult = {
        zoneId: "zone-1",
        region: "Centre",
        city: "Yaoundé",
        commune: "Mfoundi",
        baseFee: 1000,
        weightFee: 500,
        distanceFee: 250,
        totalFee: 1750,
        estimatedDays: 1,
      };

      mockDeliveryService.calculateDeliveryFee.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.calculateDeliveryFee(dto);

      expect(deliveryService.calculateDeliveryFee).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });

    it("should handle calculation errors", async () => {
      const dto: CalculateDeliveryFeeDto = {
        region: "InvalidRegion",
        city: "InvalidCity",
      };

      mockDeliveryService.calculateDeliveryFee.mockRejectedValue(
        new Error("Zone de livraison non disponible"),
      );

      await expect(controller.calculateDeliveryFee(dto)).rejects.toThrow(
        "Zone de livraison non disponible",
      );
    });
  });

  describe("checkDeliveryAvailability", () => {
    it("should check availability successfully", async () => {
      const dto: CheckDeliveryAvailabilityDto = {
        region: "Centre",
        city: "Yaoundé",
      };

      mockDeliveryService.isDeliveryAvailable.mockResolvedValue(true);

      const result = await controller.checkDeliveryAvailability(dto);

      expect(deliveryService.isDeliveryAvailable).toHaveBeenCalledWith(
        dto.region,
        dto.city,
        dto.commune,
      );
      expect(result).toEqual({ available: true });
    });

    it("should return false for unavailable zones", async () => {
      const dto: CheckDeliveryAvailabilityDto = {
        region: "InvalidRegion",
        city: "InvalidCity",
      };

      mockDeliveryService.isDeliveryAvailable.mockResolvedValue(false);

      const result = await controller.checkDeliveryAvailability(dto);

      expect(result).toEqual({ available: false });
    });
  });

  describe("getAvailableZones", () => {
    it("should return available zones", async () => {
      const expectedZones = [
        {
          id: "zone-1",
          region: "Centre",
          city: "Yaoundé",
          commune: "Mfoundi",
          isActive: true,
        },
        {
          id: "zone-2",
          region: "Littoral",
          city: "Douala",
          isActive: true,
        },
      ];

      mockDeliveryService.getAvailableZones.mockResolvedValue(expectedZones);

      const result = await controller.getAvailableZones();

      expect(deliveryService.getAvailableZones).toHaveBeenCalled();
      expect(result).toEqual(expectedZones);
    });
  });

  describe("getAvailableRegions", () => {
    it("should return available regions", async () => {
      const expectedRegions = ["Centre", "Littoral", "Ouest"];

      mockDeliveryService.getAvailableRegions.mockResolvedValue(
        expectedRegions,
      );

      const result = await controller.getAvailableRegions();

      expect(deliveryService.getAvailableRegions).toHaveBeenCalled();
      expect(result).toEqual(expectedRegions);
    });
  });

  describe("getCitiesByRegion", () => {
    it("should return cities for a region", async () => {
      const region = "Centre";
      const expectedCities = ["Yaoundé", "Mbalmayo", "Obala"];

      mockDeliveryService.getCitiesByRegion.mockResolvedValue(expectedCities);

      const result = await controller.getCitiesByRegion(region);

      expect(deliveryService.getCitiesByRegion).toHaveBeenCalledWith(region);
      expect(result).toEqual(expectedCities);
    });
  });

  describe("getCommunesByCity", () => {
    it("should return communes for a city", async () => {
      const region = "Centre";
      const city = "Yaoundé";
      const expectedCommunes = ["Mfoundi", "Djoungolo", "Efoulan"];

      mockDeliveryService.getCommunesByCity.mockResolvedValue(expectedCommunes);

      const result = await controller.getCommunesByCity(region, city);

      expect(deliveryService.getCommunesByCity).toHaveBeenCalledWith(
        region,
        city,
      );
      expect(result).toEqual(expectedCommunes);
    });
  });
});
