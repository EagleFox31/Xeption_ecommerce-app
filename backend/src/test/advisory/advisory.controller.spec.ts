import { Test, TestingModule } from "@nestjs/testing";
import { AdvisoryController } from "../../modules/advisory/advisory.controller";
import { AdvisoryService } from "../../modules/advisory/advisory.service";
import { AuthGuard } from "../../common/auth/auth.guard";
import { ConfigService } from "@nestjs/config";
import {
  CreateAdvisoryRequestDto,
  UpdateAdvisoryRequestDto,
  AdvisoryRequestQueryDto,
  GetProductRecommendationsDto,
} from "../../modules/advisory/dto/advisory.dto";
import { AdvisoryRequestStatus } from "../../domain/advisory/advisory.entity";

describe("AdvisoryController", () => {
  let controller: AdvisoryController;
  let service: AdvisoryService;

  const mockAdvisoryService = {
    createAdvisoryRequest: jest.fn(),
    getAdvisoryRequest: jest.fn(),
    getUserAdvisoryRequests: jest.fn(),
    getUserPendingRequests: jest.fn(),
    getUserCompletedRequests: jest.fn(),
    updateAdvisoryRequest: jest.fn(),
    deleteAdvisoryRequest: jest.fn(),
    getProductRecommendations: jest.fn(),
  };

  const mockAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        SUPABASE_URL: "https://test.supabase.co",
        SUPABASE_SERVICE_KEY: "test-service-key",
      };
      return config[key];
    }),
  };

  const mockUser = {
    id: "user-123",
    email: "test@example.com",
    role: "user",
  };

  const mockAdvisoryRequest = {
    id: "advisory-123",
    user_id: "user-123",
    title: "Gaming Setup Advice",
    description: "Need advice for a gaming setup within budget",
    budget: {
      min_amount: 500000,
      max_amount: 1000000,
      currency: "XAF",
      is_flexible: true,
    },
    preferences: {
      categories: ["gaming"],
      experience_level: "intermediate",
    },
    status: AdvisoryRequestStatus.PENDING,
    priority: "medium",
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdvisoryController],
      providers: [
        {
          provide: AdvisoryService,
          useValue: mockAdvisoryService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<AdvisoryController>(AdvisoryController);
    service = module.get<AdvisoryService>(AdvisoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("createAdvisoryRequest", () => {
    it("should create an advisory request", async () => {
      const createDto: CreateAdvisoryRequestDto = {
        title: "Gaming Setup Advice",
        description: "Need advice for a gaming setup within budget",
        budget: {
          min_amount: 500000,
          max_amount: 1000000,
          currency: "XAF",
          is_flexible: true,
        },
        preferences: {
          categories: ["gaming"],
          experience_level: "intermediate",
        },
      };

      mockAdvisoryService.createAdvisoryRequest.mockResolvedValue(
        mockAdvisoryRequest,
      );

      const result = await controller.createAdvisoryRequest(
        mockUser,
        createDto,
      );

      expect(service.createAdvisoryRequest).toHaveBeenCalledWith(
        mockUser.id,
        createDto,
      );
      expect(result).toEqual(mockAdvisoryRequest);
    });
  });

  describe("getMyAdvisoryRequests", () => {
    it("should get user advisory requests", async () => {
      const query: AdvisoryRequestQueryDto = {
        status: AdvisoryRequestStatus.PENDING,
        page: 1,
        limit: 10,
      };

      const mockResult = {
        requests: [mockAdvisoryRequest],
        total: 1,
        page: 1,
        limit: 10,
        total_pages: 1,
      };

      mockAdvisoryService.getUserAdvisoryRequests.mockResolvedValue(mockResult);

      const result = await controller.getMyAdvisoryRequests(mockUser, query);

      expect(service.getUserAdvisoryRequests).toHaveBeenCalledWith(
        mockUser.id,
        query,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe("getMyPendingRequests", () => {
    it("should get user pending requests", async () => {
      const limit = 5;
      const mockResult = {
        requests: [mockAdvisoryRequest],
        total: 1,
        page: 1,
        limit: 5,
        total_pages: 1,
      };

      mockAdvisoryService.getUserPendingRequests.mockResolvedValue(mockResult);

      const result = await controller.getMyPendingRequests(mockUser, limit);

      expect(service.getUserPendingRequests).toHaveBeenCalledWith(
        mockUser.id,
        limit,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe("getMyCompletedRequests", () => {
    it("should get user completed requests", async () => {
      const limit = 5;
      const mockResult = {
        requests: [
          { ...mockAdvisoryRequest, status: AdvisoryRequestStatus.COMPLETED },
        ],
        total: 1,
        page: 1,
        limit: 5,
        total_pages: 1,
      };

      mockAdvisoryService.getUserCompletedRequests.mockResolvedValue(
        mockResult,
      );

      const result = await controller.getMyCompletedRequests(mockUser, limit);

      expect(service.getUserCompletedRequests).toHaveBeenCalledWith(
        mockUser.id,
        limit,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe("getProductRecommendations", () => {
    it("should get product recommendations", async () => {
      const recommendationsDto: GetProductRecommendationsDto = {
        budget: {
          min_amount: 500000,
          max_amount: 1000000,
          currency: "XAF",
          is_flexible: true,
        },
        preferences: {
          categories: ["gaming"],
          experience_level: "intermediate",
        },
        limit: 10,
      };

      const mockRecommendations = {
        recommendations: [],
        total_found: 0,
        budget_summary: {
          min_price: 0,
          max_price: 0,
          average_price: 0,
          products_in_budget: 0,
        },
      };

      mockAdvisoryService.getProductRecommendations.mockResolvedValue(
        mockRecommendations,
      );

      const result =
        await controller.getProductRecommendations(recommendationsDto);

      expect(service.getProductRecommendations).toHaveBeenCalledWith(
        recommendationsDto.budget,
        recommendationsDto.preferences,
        recommendationsDto.limit,
      );
      expect(result).toEqual(mockRecommendations);
    });
  });

  describe("getAdvisoryRequest", () => {
    it("should get a specific advisory request", async () => {
      const requestId = "advisory-123";

      mockAdvisoryService.getAdvisoryRequest.mockResolvedValue(
        mockAdvisoryRequest,
      );

      const result = await controller.getAdvisoryRequest(mockUser, requestId);

      expect(service.getAdvisoryRequest).toHaveBeenCalledWith(
        mockUser.id,
        requestId,
      );
      expect(result).toEqual(mockAdvisoryRequest);
    });
  });

  describe("updateAdvisoryRequest", () => {
    it("should update an advisory request", async () => {
      const requestId = "advisory-123";
      const updateDto: UpdateAdvisoryRequestDto = {
        title: "Updated Gaming Setup Advice",
        status: AdvisoryRequestStatus.IN_PROGRESS,
      };

      const updatedRequest = {
        ...mockAdvisoryRequest,
        title: updateDto.title,
        status: updateDto.status,
      };

      mockAdvisoryService.updateAdvisoryRequest.mockResolvedValue(
        updatedRequest,
      );

      const result = await controller.updateAdvisoryRequest(
        mockUser,
        requestId,
        updateDto,
      );

      expect(service.updateAdvisoryRequest).toHaveBeenCalledWith(
        mockUser.id,
        requestId,
        updateDto,
      );
      expect(result).toEqual(updatedRequest);
    });
  });

  describe("deleteAdvisoryRequest", () => {
    it("should delete an advisory request", async () => {
      const requestId = "advisory-123";

      mockAdvisoryService.deleteAdvisoryRequest.mockResolvedValue(undefined);

      await controller.deleteAdvisoryRequest(mockUser, requestId);

      expect(service.deleteAdvisoryRequest).toHaveBeenCalledWith(
        mockUser.id,
        requestId,
      );
    });
  });
});
