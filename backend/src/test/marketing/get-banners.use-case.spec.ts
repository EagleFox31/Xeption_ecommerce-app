import { Test, TestingModule } from "@nestjs/testing";
import { GetBannersUseCase } from "../../application/marketing/get-banners.use-case";
import { MarketingBannerRepositoryPort } from "../../domain/marketing/banner.port";
import { MarketingBanner } from "../../domain/marketing/banner.entity";

describe("GetBannersUseCase", () => {
  let useCase: GetBannersUseCase;
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
        GetBannersUseCase,
        {
          provide: MarketingBannerRepositoryPort,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetBannersUseCase>(GetBannersUseCase);
    repository = module.get<MarketingBannerRepositoryPort>(
      MarketingBannerRepositoryPort,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const activeBanner = new MarketingBanner({
      id: "1",
      title_237: "Active Banner",
      image_url: "https://example.com/active.jpg",
      priority: 10,
      start_date: yesterday,
      end_date: tomorrow,
      active: true,
      created_at: now,
      updated_at: now,
      created_by: "admin",
    });

    const inactiveBanner = new MarketingBanner({
      id: "2",
      title_237: "Inactive Banner",
      image_url: "https://example.com/inactive.jpg",
      priority: 5,
      start_date: yesterday,
      end_date: tomorrow,
      active: false,
      created_at: now,
      updated_at: now,
      created_by: "admin",
    });

    const expiredBanner = new MarketingBanner({
      id: "3",
      title_237: "Expired Banner",
      image_url: "https://example.com/expired.jpg",
      priority: 8,
      start_date: new Date(now.getTime() - 48 * 60 * 60 * 1000),
      end_date: yesterday,
      active: true,
      created_at: now,
      updated_at: now,
      created_by: "admin",
    });

    it("should return only currently active banners", async () => {
      mockRepository.getBannersByPriority.mockResolvedValue([
        activeBanner,
        inactiveBanner,
        expiredBanner,
      ]);

      const result = await useCase.execute();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(activeBanner);
      expect(mockRepository.getBannersByPriority).toHaveBeenCalledWith(
        undefined,
      );
    });

    it("should filter by category when provided", async () => {
      mockRepository.getBannersByPriority.mockResolvedValue([activeBanner]);

      const result = await useCase.execute("electronics");

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(activeBanner);
      expect(mockRepository.getBannersByPriority).toHaveBeenCalledWith(
        "electronics",
      );
    });

    it("should return empty array when no active banners", async () => {
      mockRepository.getBannersByPriority.mockResolvedValue([
        inactiveBanner,
        expiredBanner,
      ]);

      const result = await useCase.execute();

      expect(result).toHaveLength(0);
    });

    it("should handle repository errors", async () => {
      mockRepository.getBannersByPriority.mockRejectedValue(
        new Error("Database error"),
      );

      await expect(useCase.execute()).rejects.toThrow("Database error");
    });
  });
});
