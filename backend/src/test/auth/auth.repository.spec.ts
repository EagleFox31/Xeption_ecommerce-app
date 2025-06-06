import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { AuthRepository } from "../../infrastructure/supabase/repositories/auth.repository";
import { UserProfile } from "../../domain/auth/auth.entity";

// Mock Supabase
const mockSupabaseClient = {
  auth: {
    admin: {
      getUserById: jest.fn(),
    },
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
      })),
    })),
    upsert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(),
      })),
    })),
  })),
};

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

describe("AuthRepository", () => {
  let repository: AuthRepository;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthRepository,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                SUPABASE_URL: "https://test.supabase.co",
                SUPABASE_SERVICE_KEY: "test-service-key",
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    repository = module.get<AuthRepository>(AuthRepository);
    configService = module.get<ConfigService>(ConfigService);
  });

  it("should be defined", () => {
    expect(repository).toBeDefined();
  });

  describe("getUserProfile", () => {
    it("should return user profile when user exists", async () => {
      const mockAuthUser = {
        user: {
          id: "123",
          email: "test@example.com",
          user_metadata: {
            first_name: "John",
            last_name: "Doe",
            role: "customer",
          },
          phone: "+237123456789",
          email_confirmed_at: "2023-01-01T00:00:00Z",
          created_at: "2023-01-01T00:00:00Z",
          updated_at: "2023-01-01T00:00:00Z",
        },
      };

      const mockProfileData = {
        first_name: "John",
        last_name: "Doe",
        phone: "+237123456789",
        role: "customer",
      };

      mockSupabaseClient.auth.admin.getUserById.mockResolvedValue({
        data: mockAuthUser,
        error: null,
      });

      mockSupabaseClient.from().select().eq().single.mockResolvedValue({
        data: mockProfileData,
        error: null,
      });

      const result = await repository.getUserProfile("123");

      expect(result).toBeInstanceOf(UserProfile);
      expect(result.id).toBe("123");
      expect(result.email).toBe("test@example.com");
      expect(result.firstName).toBe("John");
      expect(result.lastName).toBe("Doe");
    });

    it("should return null when user does not exist", async () => {
      mockSupabaseClient.auth.admin.getUserById.mockResolvedValue({
        data: { user: null },
        error: { message: "User not found" },
      });

      const result = await repository.getUserProfile("123");

      expect(result).toBeNull();
    });
  });

  describe("validateUserExists", () => {
    it("should return true when user exists", async () => {
      mockSupabaseClient.auth.admin.getUserById.mockResolvedValue({
        data: { user: { id: "123" } },
        error: null,
      });

      const result = await repository.validateUserExists("123");

      expect(result).toBe(true);
    });

    it("should return false when user does not exist", async () => {
      mockSupabaseClient.auth.admin.getUserById.mockResolvedValue({
        data: { user: null },
        error: { message: "User not found" },
      });

      const result = await repository.validateUserExists("123");

      expect(result).toBe(false);
    });
  });
});
