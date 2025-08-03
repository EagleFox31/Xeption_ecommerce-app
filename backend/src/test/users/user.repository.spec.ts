import { Test, TestingModule } from "@nestjs/testing";
import { User, UserAddress, AddressType } from "../../domain/users/user.entity";
import { PrismaUserRepository } from "../../infrastructure/prisma/repositories/user.repository";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";

// Mock PrismaService
const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  address: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn(),
  },
};

describe("PrismaUserRepository", () => {
  let repository: PrismaUserRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaUserRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<PrismaUserRepository>(PrismaUserRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(repository).toBeDefined();
  });

  describe("getUserById", () => {
    it("should return user when user exists", async () => {
      const mockPrismaUser = {
        id: "123",
        email: "test@example.com",
        fullName: "John Doe",
        phone237: "+237123456789",
        role: "customer",
        loyaltyPoints: 0,
        preferredLang: "en",
        createdAt: new Date("2023-01-01T00:00:00Z"),
        updatedAt: new Date("2023-01-01T00:00:00Z"),
      };

      // Reset mocks for this test
      jest.clearAllMocks();

      // Setup Prisma mock
      mockPrismaService.user.findUnique.mockResolvedValue(mockPrismaUser);

      const result = await repository.getUserById("123");

      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe("123");
      expect(result.email).toBe("test@example.com");
      expect(result.firstName).toBe("John");
      expect(result.lastName).toBe("Doe");
      expect(result.phone).toBe("+237123456789");
    });

    it("should return null when user does not exist", async () => {
      // Reset mocks for this test
      jest.clearAllMocks();
      
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.getUserById("123");

      expect(result).toBeNull();
    });
  });

  describe("getUserAddresses", () => {
    it("should return user addresses", async () => {
      const mockAddressData = [
        {
          id: BigInt(123),
          userId: "123",
          addressLine: "123 Main St, Apt 4B",
          isDefault: true,
          country: "CM",
          createdAt: new Date("2023-01-01T00:00:00Z"),
          updatedAt: new Date("2023-01-01T00:00:00Z"),
          region: { name: "Littoral" },
          city: { name: "Douala" },
          commune: { name: "Bonanjo" },
        },
      ];

      // Reset the mock structure to ensure it's clean
      jest.clearAllMocks();
      
      // Setup Prisma mock
      mockPrismaService.address.findMany.mockResolvedValue(mockAddressData);

      const result = await repository.getUserAddresses("123");

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(UserAddress);
      expect(result[0].id).toBe("123");
      expect(result[0].type).toBe(AddressType.HOME);
      expect(result[0].addressLine1).toBe("123 Main St, Apt 4B");
      expect(result[0].city).toBe("Douala");
      expect(result[0].region).toBe("Littoral");
    });
  });

  describe("validateUserExists", () => {
    it("should return true when user exists", async () => {
      // Reset mocks for this test
      jest.clearAllMocks();
      
      mockPrismaService.user.count.mockResolvedValue(1);

      const result = await repository.validateUserExists("123");

      expect(result).toBe(true);
    });

    it("should return false when user does not exist", async () => {
      // Reset mocks for this test
      jest.clearAllMocks();
      
      mockPrismaService.user.count.mockResolvedValue(0);

      const result = await repository.validateUserExists("123");

      expect(result).toBe(false);
    });
  });
  
  describe("getDefaultAddress", () => {
    it("should return default address when it exists", async () => {
      const mockDefaultAddress = {
        id: BigInt(123),
        userId: "123",
        addressLine: "123 Main St",
        isDefault: true,
        country: "CM",
        createdAt: new Date("2023-01-01T00:00:00Z"),
        updatedAt: new Date("2023-01-01T00:00:00Z"),
        region: { name: "Littoral" },
        city: { name: "Douala" },
        commune: { name: "Bonanjo" },
      };

      // Reset mocks for this test
      jest.clearAllMocks();
      
      mockPrismaService.address.findFirst.mockResolvedValue(mockDefaultAddress);

      const result = await repository.getDefaultAddress("123");

      expect(result).toBeInstanceOf(UserAddress);
      expect(result.id).toBe("123");
      expect(result.isDefault).toBe(true);
    });

    it("should return null when no default address exists", async () => {
      // Reset mocks for this test
      jest.clearAllMocks();
      
      mockPrismaService.address.findFirst.mockResolvedValue(null);

      const result = await repository.getDefaultAddress("123");

      expect(result).toBeNull();
    });
  });
});
