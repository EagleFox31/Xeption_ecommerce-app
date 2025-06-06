import { Test, TestingModule } from "@nestjs/testing";
import { CreateRFQRequestUseCase } from "../../application/rfq/create-rfq-request.use-case";
import { RFQRepository } from "../../domain/rfq/rfq.port";
import { RFQStatus } from "../../domain/rfq/rfq.entity";

describe("CreateRFQRequestUseCase", () => {
  let useCase: CreateRFQRequestUseCase;
  let repository: RFQRepository;

  const mockRepository = {
    createRFQRequest: jest.fn(),
    createRFQItem: jest.fn(),
    getRFQRequestById: jest.fn(),
    getUserRFQRequests: jest.fn(),
    updateRFQRequest: jest.fn(),
    deleteRFQRequest: jest.fn(),
    createRFQ: jest.fn(),
    getRFQById: jest.fn(),
    getAllRFQs: jest.fn(),
    getRFQsByStatus: jest.fn(),
    updateRFQ: jest.fn(),
    assignRFQToAgent: jest.fn(),
    getRFQItems: jest.fn(),
    updateRFQItem: jest.fn(),
    deleteRFQItem: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateRFQRequestUseCase,
        {
          provide: RFQRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateRFQRequestUseCase>(CreateRFQRequestUseCase);
    repository = module.get<RFQRepository>(RFQRepository);
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should create an RFQ request with items", async () => {
    const command = {
      companyName: "Test Company",
      contactName: "John Doe",
      contactEmail: "john@test.com",
      budgetMinXaf: 100000,
      budgetMaxXaf: 500000,
      isUrgent: false,
      comment: "Test comment",
      createdBy: "user-123",
      items: [
        {
          categoryId: 1,
          qty: 5,
          specsNote: "Test specs",
        },
        {
          categoryId: 2,
          qty: 3,
          specsNote: "Another specs",
        },
      ],
    };

    const mockRFQRequest = {
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

    const mockRFQItem = {
      id: 1,
      rfqId: "rfq-123",
      categoryId: 1,
      qty: 5,
      specsNote: "Test specs",
    };

    mockRepository.createRFQRequest.mockResolvedValue(mockRFQRequest);
    mockRepository.createRFQItem.mockResolvedValue(mockRFQItem);

    const result = await useCase.execute(command);

    expect(repository.createRFQRequest).toHaveBeenCalledWith({
      companyName: "Test Company",
      contactName: "John Doe",
      contactEmail: "john@test.com",
      budgetMinXaf: 100000,
      budgetMaxXaf: 500000,
      isUrgent: false,
      comment: "Test comment",
      deadline: undefined,
      createdBy: "user-123",
      rfqStatus: RFQStatus.DRAFT,
    });

    expect(repository.createRFQItem).toHaveBeenCalledTimes(2);
    expect(repository.createRFQItem).toHaveBeenCalledWith({
      rfqId: "rfq-123",
      categoryId: 1,
      qty: 5,
      specsNote: "Test specs",
    });

    expect(result).toEqual(mockRFQRequest);
  });
});
