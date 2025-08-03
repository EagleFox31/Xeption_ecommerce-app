import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { RFQController } from "../../modules/rfq/rfq.controller";
import { RFQService } from "../../modules/rfq/rfq.service";
import { AuthenticatedUser } from "../../common/auth/jwt.types";
import { RFQStatus } from "../../domain/rfq/rfq.entity";
import { AuthGuard } from "../../common/auth/auth.guard";
import { createMockConfigService, MockAuthGuard } from "../test-utils";

describe("RFQController", () => {
  let controller: RFQController;
  let service: RFQService;

  const mockUser: AuthenticatedUser = {
    id: "user-123",
    email: "test@example.com",
    role: "client",
  };

  const mockRFQService = {
    createRFQRequest: jest.fn(),
    getRFQRequest: jest.fn(),
    getUserRFQRequests: jest.fn(),
    updateRFQRequest: jest.fn(),
    getAllRFQs: jest.fn(),
    createRFQResponse: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RFQController],
      providers: [
        {
          provide: RFQService,
          useValue: mockRFQService,
        },
        {
          provide: ConfigService,
          useFactory: createMockConfigService,
        },
      ],
    })
    .overrideGuard(AuthGuard)
    .useClass(MockAuthGuard)
    .compile();

    controller = module.get<RFQController>(RFQController);
    service = module.get<RFQService>(RFQService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("createRFQRequest", () => {
    it("should create an RFQ request", async () => {
      const createDto = {
        companyName: "Test Company",
        contactName: "John Doe",
        contactEmail: "john@test.com",
        budgetMinXaf: 100000,
        budgetMaxXaf: 500000,
        isUrgent: false,
        comment: "Test comment",
        items: [
          {
            categoryId: 1,
            qty: 5,
            specsNote: "Test specs",
          },
        ],
      };

      const mockResult = {
        id: "rfq-123",
        companyName: "Test Company",
        contactName: "John Doe",
        contactEmail: "john@test.com",
        budgetMinXaf: 100000,
        budgetMaxXaf: 500000,
        isUrgent: false,
        comment: "Test comment",
        deadline: undefined,
        submittedAt: new Date(),
        createdBy: "user-123",
        rfqStatus: RFQStatus.DRAFT,
      };

      mockRFQService.createRFQRequest.mockResolvedValue(mockResult);

      const result = await controller.createRFQRequest(createDto, mockUser);

      expect(service.createRFQRequest).toHaveBeenCalledWith(
        createDto,
        mockUser,
      );
      expect(result.id).toBe("rfq-123");
      expect(result.companyName).toBe("Test Company");
    });
  });

  describe("getRFQRequest", () => {
    it("should get an RFQ request by ID", async () => {
      const mockResult = {
        id: "rfq-123",
        companyName: "Test Company",
        contactName: "John Doe",
        contactEmail: "john@test.com",
        budgetMinXaf: 100000,
        budgetMaxXaf: 500000,
        isUrgent: false,
        comment: "Test comment",
        deadline: undefined,
        submittedAt: new Date(),
        createdBy: "user-123",
        rfqStatus: RFQStatus.DRAFT,
        items: [],
      };

      mockRFQService.getRFQRequest.mockResolvedValue(mockResult);

      const result = await controller.getRFQRequest("rfq-123", mockUser);

      expect(service.getRFQRequest).toHaveBeenCalledWith("rfq-123", mockUser);
      expect(result.id).toBe("rfq-123");
    });
  });

  describe("getUserRFQRequests", () => {
    it("should get user RFQ requests", async () => {
      const mockResults = [
        {
          id: "rfq-123",
          companyName: "Test Company",
          contactName: "John Doe",
          contactEmail: "john@test.com",
          budgetMinXaf: 100000,
          budgetMaxXaf: 500000,
          isUrgent: false,
          comment: "Test comment",
          deadline: undefined,
          submittedAt: new Date(),
          createdBy: "user-123",
          rfqStatus: RFQStatus.DRAFT,
        },
      ];

      mockRFQService.getUserRFQRequests.mockResolvedValue(mockResults);

      const result = await controller.getUserRFQRequests(mockUser);

      expect(service.getUserRFQRequests).toHaveBeenCalledWith(mockUser);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("rfq-123");
    });
  });
});
