import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import {
  CreateBannerUseCase,
  CreateBannerRequest,
} from "../../application/marketing/create-banner.use-case";
import { MarketingBannerRepositoryPort, MARKETING_BANNER_REPOSITORY } from "../../domain/marketing/banner.port";
import { MarketingBanner } from "../../domain/marketing/banner.entity";

describe("CreateBannerUseCase", () => {
  let useCase: CreateBannerUseCase;
  let repository: MarketingBannerRepositoryPort;

  const mockRepository = {
    createBanner: jest.fn(),
    getBannerById: jest.fn(),
    getActiveBanners: jest.fn(),
    getAllBanners: jest.fn(),
    updateBanner: jest.fn(),
    toggleBannerStatus: jest.fn(),
    deleteBanner: jest.fn(),
    getBannersByPriority: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateBannerUseCase,
        {
          provide: MARKETING_BANNER_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateBannerUseCase>(CreateBannerUseCase);
    repository = module.get<MarketingBannerRepositoryPort>(
      MARKETING_BANNER_REPOSITORY,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    const validRequest: CreateBannerRequest = {
      title_237: "Promo Test",
      description_237: "Description test",
      image_url: "https://example.com/banner.jpg",
      cta_url: "https://example.com/promo",
      category_id: "electronics",
      priority: 10,
      start_date: new Date("2024-01-01"),
      end_date: new Date("2024-12-31"),
      active: true,
      created_by: "admin-user-id",
    };

    const mockBanner = new MarketingBanner({
      id: "1",
      ...validRequest,
      created_at: new Date(),
      updated_at: new Date(),
    });

    it("should create a banner successfully", async () => {
      mockRepository.createBanner.mockResolvedValue(mockBanner);

      const result = await useCase.execute(validRequest);

      expect(result).toEqual(mockBanner);
      expect(mockRepository.createBanner).toHaveBeenCalledWith({
        ...validRequest,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
    });

    it("should throw BadRequestException when start_date >= end_date", async () => {
      const invalidRequest = {
        ...validRequest,
        start_date: new Date("2024-12-31"),
        end_date: new Date("2024-01-01"),
      };

      await expect(useCase.execute(invalidRequest)).rejects.toThrow(
        new BadRequestException("Start date must be before end date"),
      );

      expect(mockRepository.createBanner).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException when priority is negative", async () => {
      const invalidRequest = {
        ...validRequest,
        priority: -1,
      };

      await expect(useCase.execute(invalidRequest)).rejects.toThrow(
        new BadRequestException("Priority must be a positive number"),
      );

      expect(mockRepository.createBanner).not.toHaveBeenCalled();
    });

    it("should handle repository errors", async () => {
      mockRepository.createBanner.mockRejectedValue(
        new Error("Database error"),
      );

      await expect(useCase.execute(validRequest)).rejects.toThrow(
        "Database error",
      );
    });
  });
});
