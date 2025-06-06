import { Test, TestingModule } from "@nestjs/testing";
import { TradeInController } from "../../modules/tradein/tradein.controller";
import { TradeInService } from "../../modules/tradein/tradein.service";
import {
  DeviceCondition,
  TradeInStatus,
} from "../../domain/tradein/tradein.entity";
import { JwtPayload } from "../../common/auth/jwt.types";

describe("TradeInController", () => {
  let controller: TradeInController;
  let service: TradeInService;

  const mockUser: JwtPayload = {
    sub: "user-123",
    email: "test@example.com",
    role: "user",
  };

  const mockTradeInRequest = {
    id: "request-123",
    userId: "user-123",
    deviceId: "device-123",
    condition: DeviceCondition.GOOD,
    description: "Test device",
    images: ["image1.jpg"],
    estimatedValue: 500,
    status: TradeInStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDevice = {
    id: "device-123",
    brand: "Apple",
    model: "iPhone 12",
    category: "smartphone",
    baseValue: 700,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTradeInService = {
    createTradeInRequest: jest.fn(),
    getTradeInRequest: jest.fn(),
    getUserTradeInRequests: jest.fn(),
    searchDevices: jest.fn(),
    getDevicesByCategory: jest.fn(),
    evaluateTradeIn: jest.fn(),
    updateTradeInStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TradeInController],
      providers: [
        {
          provide: TradeInService,
          useValue: mockTradeInService,
        },
      ],
    }).compile();

    controller = module.get<TradeInController>(TradeInController);
    service = module.get<TradeInService>(TradeInService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createTradeInRequest", () => {
    it("should create a trade-in request successfully", async () => {
      const createDto = {
        deviceId: "device-123",
        condition: DeviceCondition.GOOD,
        description: "Test device",
        images: ["image1.jpg"],
      };

      mockTradeInService.createTradeInRequest.mockResolvedValue(
        mockTradeInRequest,
      );

      const result = await controller.createTradeInRequest(mockUser, createDto);

      expect(service.createTradeInRequest).toHaveBeenCalledWith(
        mockUser.sub,
        createDto.deviceId,
        createDto.condition,
        createDto.description,
        createDto.images,
      );
      expect(result).toEqual(mockTradeInRequest);
    });
  });

  describe("getUserTradeInRequests", () => {
    it("should return user trade-in requests", async () => {
      const mockRequests = [mockTradeInRequest];
      mockTradeInService.getUserTradeInRequests.mockResolvedValue(mockRequests);

      const result = await controller.getUserTradeInRequests(mockUser);

      expect(service.getUserTradeInRequests).toHaveBeenCalledWith(mockUser.sub);
      expect(result).toEqual(mockRequests);
    });
  });

  describe("getTradeInRequest", () => {
    it("should return a specific trade-in request", async () => {
      const requestId = "request-123";
      mockTradeInService.getTradeInRequest.mockResolvedValue(
        mockTradeInRequest,
      );

      const result = await controller.getTradeInRequest(mockUser, requestId);

      expect(service.getTradeInRequest).toHaveBeenCalledWith(
        requestId,
        mockUser.sub,
      );
      expect(result).toEqual(mockTradeInRequest);
    });
  });

  describe("searchDevices", () => {
    it("should search devices successfully", async () => {
      const searchDto = { query: "iPhone", category: "smartphone" };
      const mockDevices = [mockDevice];
      mockTradeInService.searchDevices.mockResolvedValue(mockDevices);

      const result = await controller.searchDevices(searchDto);

      expect(service.searchDevices).toHaveBeenCalledWith(
        searchDto.query,
        searchDto.category,
      );
      expect(result).toEqual(mockDevices);
    });
  });

  describe("getDevicesByCategory", () => {
    it("should return devices by category", async () => {
      const category = "smartphone";
      const mockDevices = [mockDevice];
      mockTradeInService.getDevicesByCategory.mockResolvedValue(mockDevices);

      const result = await controller.getDevicesByCategory(category);

      expect(service.getDevicesByCategory).toHaveBeenCalledWith(category);
      expect(result).toEqual(mockDevices);
    });
  });

  describe("evaluateTradeIn", () => {
    it("should evaluate a trade-in request successfully", async () => {
      const requestId = "request-123";
      const evaluateDto = {
        condition: DeviceCondition.GOOD,
        functionalityScore: 85,
        cosmeticScore: 80,
        notes: "Good condition overall",
      };

      const evaluatedRequest = {
        ...mockTradeInRequest,
        status: TradeInStatus.APPROVED,
        finalValue: 450,
        evaluatorNotes: evaluateDto.notes,
      };

      mockTradeInService.evaluateTradeIn.mockResolvedValue(evaluatedRequest);

      const result = await controller.evaluateTradeIn(
        mockUser,
        requestId,
        evaluateDto,
      );

      expect(service.evaluateTradeIn).toHaveBeenCalledWith(
        requestId,
        mockUser.sub,
        evaluateDto.condition,
        evaluateDto.functionalityScore,
        evaluateDto.cosmeticScore,
        evaluateDto.notes,
      );
      expect(result).toEqual(evaluatedRequest);
    });
  });

  describe("updateTradeInStatus", () => {
    it("should update trade-in status successfully", async () => {
      const requestId = "request-123";
      const updateDto = {
        status: TradeInStatus.COMPLETED,
        evaluatorNotes: "Payment processed",
      };

      const updatedRequest = {
        ...mockTradeInRequest,
        status: TradeInStatus.COMPLETED,
        evaluatorNotes: updateDto.evaluatorNotes,
      };

      mockTradeInService.updateTradeInStatus.mockResolvedValue(updatedRequest);

      const result = await controller.updateTradeInStatus(requestId, updateDto);

      expect(service.updateTradeInStatus).toHaveBeenCalledWith(
        requestId,
        updateDto.status,
        updateDto.evaluatorNotes,
      );
      expect(result).toEqual(updatedRequest);
    });
  });
});
