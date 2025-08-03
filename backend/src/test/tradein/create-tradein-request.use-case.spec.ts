import { Test, TestingModule } from "@nestjs/testing";
import { CreateTradeInRequestUseCase } from "../../application/tradein/create-tradein-request.use-case";
import { TradeInRepositoryPort, TRADEIN_REPOSITORY } from "../../domain/tradein/tradein.port";
import { TradeInValuationService } from "../../domain/tradein/tradein-valuation.service";
import {
  DeviceCondition,
  TradeInStatus,
} from "../../domain/tradein/tradein.entity";

describe("CreateTradeInRequestUseCase", () => {
  let useCase: CreateTradeInRequestUseCase;
  let repository: TradeInRepositoryPort;
  let valuationService: TradeInValuationService;

  const mockDevice = {
    id: "device-123",
    brand: "Apple",
    model: "iPhone 12",
    category: "smartphone",
    baseValue: 700,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTradeInRequest = {
    id: "request-123",
    userId: "user-123",
    deviceId: "device-123",
    condition: DeviceCondition.GOOD,
    description: "Test device",
    images: ["image1.jpg"],
    estimatedValue: 490,
    status: TradeInStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    getDeviceById: jest.fn(),
    createTradeInRequest: jest.fn(),
    getTradeInRequestById: jest.fn(),
    getTradeInRequestsByUserId: jest.fn(),
    updateTradeInRequest: jest.fn(),
    deleteTradeInRequest: jest.fn(),
    searchDevices: jest.fn(),
    getDevicesByCategory: jest.fn(),
    createEvaluation: jest.fn(),
    getEvaluationByRequestId: jest.fn(),
  };

  const mockValuationService = {
    estimate: jest.fn(async (_deviceId: string, condition: DeviceCondition) => {
      const multipliers = {
        [DeviceCondition.EXCELLENT]: 0.85,
        [DeviceCondition.GOOD]: 0.7,
        [DeviceCondition.FAIR]: 0.5,
        [DeviceCondition.POOR]: 0.3,
        [DeviceCondition.BROKEN]: 0.15,
      };
      return Math.round(mockDevice.baseValue * multipliers[condition]);
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTradeInRequestUseCase,
        {
          provide: TRADEIN_REPOSITORY,
          useValue: mockRepository,
        },
        {
          provide: TradeInValuationService,
          useValue: mockValuationService,
        },
      ],
    }).compile();

    useCase = module.get<CreateTradeInRequestUseCase>(
      CreateTradeInRequestUseCase,
    );
    repository = module.get<TradeInRepositoryPort>(TRADEIN_REPOSITORY);
    valuationService = module.get<TradeInValuationService>(TradeInValuationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should create a trade-in request successfully", async () => {
      mockRepository.getDeviceById.mockResolvedValue(mockDevice);
      mockRepository.createTradeInRequest.mockResolvedValue(mockTradeInRequest);

      const result = await useCase.execute(
        "user-123",
        "device-123",
        DeviceCondition.GOOD,
        "Test device",
        ["image1.jpg"],
      );

      expect(repository.getDeviceById).toHaveBeenCalledWith("device-123");
      expect(repository.createTradeInRequest).toHaveBeenCalledWith({
        userId: "user-123",
        deviceId: "device-123",
        condition: DeviceCondition.GOOD,
        description: "Test device",
        images: ["image1.jpg"],
        estimatedValue: 490, // 700 * 0.70 (good condition)
        status: TradeInStatus.PENDING,
      });
      expect(result).toEqual(mockTradeInRequest);
    });

    it("should throw error if device not found", async () => {
      mockRepository.getDeviceById.mockResolvedValue(null);

      await expect(
        useCase.execute(
          "user-123",
          "device-123",
          DeviceCondition.GOOD,
          "Test device",
        ),
      ).rejects.toThrow("Device not found");

      expect(repository.getDeviceById).toHaveBeenCalledWith("device-123");
      expect(repository.createTradeInRequest).not.toHaveBeenCalled();
    });

    it("should calculate correct estimated value for different conditions", async () => {
      mockRepository.getDeviceById.mockResolvedValue(mockDevice);
      mockRepository.createTradeInRequest.mockResolvedValue(mockTradeInRequest);

      // Test excellent condition (85%)
      await useCase.execute(
        "user-123",
        "device-123",
        DeviceCondition.EXCELLENT,
        "Excellent device",
      );

      expect(repository.createTradeInRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          estimatedValue: 595, // 700 * 0.85
        }),
      );

      // Test fair condition (50%)
      await useCase.execute(
        "user-123",
        "device-123",
        DeviceCondition.FAIR,
        "Fair device",
      );

      expect(repository.createTradeInRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          estimatedValue: 350, // 700 * 0.50
        }),
      );

      // Test broken condition (15%)
      await useCase.execute(
        "user-123",
        "device-123",
        DeviceCondition.BROKEN,
        "Broken device",
      );

      expect(repository.createTradeInRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          estimatedValue: 105, // 700 * 0.15
        }),
      );
    });

    it("should handle empty images array", async () => {
      mockRepository.getDeviceById.mockResolvedValue(mockDevice);
      mockRepository.createTradeInRequest.mockResolvedValue(mockTradeInRequest);

      await useCase.execute(
        "user-123",
        "device-123",
        DeviceCondition.GOOD,
        "Test device",
      );

      expect(repository.createTradeInRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          images: [],
        }),
      );
    });

    it("should handle optional description", async () => {
      mockRepository.getDeviceById.mockResolvedValue(mockDevice);
      mockRepository.createTradeInRequest.mockResolvedValue(mockTradeInRequest);

      await useCase.execute("user-123", "device-123", DeviceCondition.GOOD);

      expect(repository.createTradeInRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          description: undefined,
        }),
      );
    });
  });
});
