import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { UserRepository } from "../../infrastructure/supabase/repositories/user.repository";
import { User, UserAddress, AddressType } from "../../domain/users/user.entity";

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
        order: jest.fn(() => ({
          order: jest.fn(),
        })),
      })),
      order: jest.fn(() => ({
        order: jest.fn(),
      })),
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(),
      })),
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
    upsert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(),
      })),
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(() => ({
        eq: jest.fn(),
      })),
    })),
  })),
};

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

describe("UserRepository", () => {
  let repository: UserRepository;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
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

    repository = module.get<UserRepository>(UserRepository);
    configService = module.get<ConfigService>(ConfigService);
  });

  it("should be defined", () => {
    expect(repository).toBeDefined();
  });

  describe("getUserById", () => {
    it("should return user when user exists", async () => {
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

      const result = await repository.getUserById("123");

      expect(result).toBeInstanceOf(User);
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

      const result = await repository.getUserById("123");

      expect(result).toBeNull();
    });
  });

  describe("getUserAddresses", () => {
    it("should return user addresses", async () => {
      const mockAddressData = [
        {
          id: "addr-123",
          user_id: "123",
          type: "home",
          first_name: "John",
          last_name: "Doe",
          phone: "+237123456789",
          address_line_1: "123 Main St",
          address_line_2: "Apt 4B",
          city: "Douala",
          region: "Littoral",
          postal_code: "12345",
          country: "CM",
          is_default: true,
          created_at: "2023-01-01T00:00:00Z",
          updated_at: "2023-01-01T00:00:00Z",
        },
      ];

      mockSupabaseClient.from().select().eq().order().order.mockResolvedValue({
        data: mockAddressData,
        error: null,
      });

      const result = await repository.getUserAddresses("123");

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(UserAddress);
      expect(result[0].id).toBe("addr-123");
      expect(result[0].type).toBe(AddressType.HOME);
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
