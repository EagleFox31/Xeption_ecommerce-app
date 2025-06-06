import { Test, TestingModule } from "@nestjs/testing";
import { MarketingController } from "../../modules/marketing/marketing.controller";
import { MarketingService } from "../../modules/marketing/marketing.service";
import { MarketingBanner } from "../../domain/marketing/banner.entity";
import { AuthenticatedUser } from "../../common/auth/jwt.types";
import {
  CreateMarketingBannerDto,
  UpdateMarketingBannerDto,
} from "../../modules/marketing/dto/marketing.dto";

describe("MarketingController", () => {
  let controller: MarketingController;
  let service: MarketingService;

  const mockMarketingService = {
    getActiveBanners: jest.fn(),
    getAllBanners: jest.fn(),
    getBannerById: jest.fn(),
    createBanner: jest.fn(),
    updateBanner: jest.fn(),
    toggleBannerStatus: jest.fn(),
    deleteBanner: jest.fn(),
  };

  const mockBanner = new MarketingBanner({
    id: "1",
    title_237: "Promo Cameroun",
    description_237: "Grande promotion sur les smartphones",
    image_url: "https://example.com/banner.jpg",
    cta_url: "https://example.com/promo",
    category_id: "electronics",
    priority: 10,
    start_date: new Date("2024-01-01"),
    end_date: new Date("2024-12-31"),
    active: true,
    created_at: new Date(),
    updated_at: new Date(),
    created_by: "admin-user-id",
  });

  const mockUser: AuthenticatedUser = {
    id: "admin-user-id",
    email: "admin@example.com",
    role: "admin",
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarketingController],
      providers: [
        {
          provide: MarketingService,
          useValue: mockMarketingService,
        },
      ],
    }).compile();

    controller = module.get<MarketingController>(MarketingController);
    service = module.get<MarketingService>(MarketingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getActiveBanners", () => {
    it("should return active banners", async () => {
      mockMarketingService.getActiveBanners.mockResolvedValue([mockBanner]);

      const result = await controller.getActiveBanners();

      expect(result).toHaveLength(1);
      expect(result[0].title_237).toBe("Promo Cameroun");
      expect(mockMarketingService.getActiveBanners).toHaveBeenCalledWith(
        undefined,
      );
    });

    it("should return active banners filtered by category", async () => {
      mockMarketingService.getActiveBanners.mockResolvedValue([mockBanner]);

      const result = await controller.getActiveBanners("electronics");

      expect(result).toHaveLength(1);
      expect(mockMarketingService.getActiveBanners).toHaveBeenCalledWith(
        "electronics",
      );
    });
  });

  describe("getAllBanners", () => {
    it("should return all banners for admin", async () => {
      mockMarketingService.getAllBanners.mockResolvedValue([mockBanner]);

      const result = await controller.getAllBanners();

      expect(result).toHaveLength(1);
      expect(result[0].title_237).toBe("Promo Cameroun");
      expect(mockMarketingService.getAllBanners).toHaveBeenCalled();
    });
  });

  describe("getBannerById", () => {
    it("should return banner by ID", async () => {
      mockMarketingService.getBannerById.mockResolvedValue(mockBanner);

      const result = await controller.getBannerById("1");

      expect(result.id).toBe("1");
      expect(result.title_237).toBe("Promo Cameroun");
      expect(mockMarketingService.getBannerById).toHaveBeenCalledWith("1");
    });
  });

  describe("createBanner", () => {
    it("should create a new banner", async () => {
      const createDto: CreateMarketingBannerDto = {
        title_237: "Nouvelle Promo",
        image_url: "https://example.com/new-banner.jpg",
        priority: 5,
        start_date: "2024-01-01T00:00:00.000Z",
        end_date: "2024-12-31T23:59:59.000Z",
        active: true,
      };

      mockMarketingService.createBanner.mockResolvedValue(mockBanner);

      const result = await controller.createBanner(createDto, mockUser);

      expect(result.title_237).toBe("Promo Cameroun");
      expect(mockMarketingService.createBanner).toHaveBeenCalledWith({
        ...createDto,
        start_date: new Date(createDto.start_date),
        end_date: new Date(createDto.end_date),
        created_by: mockUser.id,
      });
    });
  });

  describe("updateBanner", () => {
    it("should update an existing banner", async () => {
      const updateDto: UpdateMarketingBannerDto = {
        title_237: "Promo Mise à Jour",
        priority: 15,
      };

      mockMarketingService.updateBanner.mockResolvedValue({
        ...mockBanner,
        title_237: "Promo Mise à Jour",
        priority: 15,
      });

      const result = await controller.updateBanner("1", updateDto);

      expect(result.title_237).toBe("Promo Mise à Jour");
      expect(result.priority).toBe(15);
      expect(mockMarketingService.updateBanner).toHaveBeenCalledWith(
        "1",
        updateDto,
      );
    });
  });

  describe("toggleBannerStatus", () => {
    it("should toggle banner status", async () => {
      const toggleDto = { active: false };
      const inactiveBanner = { ...mockBanner, active: false };

      mockMarketingService.toggleBannerStatus.mockResolvedValue(inactiveBanner);

      const result = await controller.toggleBannerStatus("1", toggleDto);

      expect(result.active).toBe(false);
      expect(mockMarketingService.toggleBannerStatus).toHaveBeenCalledWith(
        "1",
        false,
      );
    });
  });

  describe("deleteBanner", () => {
    it("should delete a banner", async () => {
      mockMarketingService.deleteBanner.mockResolvedValue(undefined);

      await controller.deleteBanner("1");

      expect(mockMarketingService.deleteBanner).toHaveBeenCalledWith("1");
    });
  });
});
