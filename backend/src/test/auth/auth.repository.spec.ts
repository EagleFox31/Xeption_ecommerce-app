import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { PrismaAuthRepository } from "../../infrastructure/prisma/repositories/auth.repository";
import { UserProfile } from "../../domain/auth/auth.entity";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";

// Mock PrismaService
const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
  userProfile: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
};

describe("PrismaAuthRepository", () => {
  let repository: PrismaAuthRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaAuthRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<PrismaAuthRepository>(PrismaAuthRepository);
    prismaService = module.get<PrismaService>(PrismaService);
    
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(repository).toBeDefined();
  });

  describe("getUserProfile", () => {
    it("should return user profile when user exists", async () => {
      const mockUser = {
        id: "123",
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        phone: "+237123456789",
        role: "customer",
        emailVerified: new Date("2023-01-01T00:00:00Z"),
        createdAt: new Date("2023-01-01T00:00:00Z"),
        updatedAt: new Date("2023-01-01T00:00:00Z"),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.getUserProfile("123");

      expect(result).toBeInstanceOf(UserProfile);
      expect(result.id).toBe("123");
      expect(result.email).toBe("test@example.com");
      expect(result.firstName).toBe("John");
      expect(result.lastName).toBe("Doe");
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: "123" }
      });
    });

    it("should return null when user does not exist", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.getUserProfile("123");

      expect(result).toBeNull();
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: "123" }
      });
    });
  });

  describe("validateUserExists", () => {
    it("should return true when user exists", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: "123" });

      const result = await repository.validateUserExists("123");

      expect(result).toBe(true);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: "123" },
        select: { id: true }
      });
    });

    it("should return false when user does not exist", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.validateUserExists("123");

      expect(result).toBe(false);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: "123" },
        select: { id: true }
      });
    });
  });
});
