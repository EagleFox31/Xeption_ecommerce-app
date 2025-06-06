import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { GetUserProfileUseCase } from "../../application/auth/get-user-profile.use-case";
import { AuthRepositoryPort } from "../../domain/auth/auth.port";
import { UserProfile } from "../../domain/auth/auth.entity";

describe("GetUserProfileUseCase", () => {
  let useCase: GetUserProfileUseCase;
  let authRepository: AuthRepositoryPort;

  const mockUserProfile = new UserProfile(
    "123",
    "test@example.com",
    "John",
    "Doe",
    "+237123456789",
    "customer",
    true,
    new Date(),
    new Date(),
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserProfileUseCase,
        {
          provide: AuthRepositoryPort,
          useValue: {
            getUserProfile: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetUserProfileUseCase>(GetUserProfileUseCase);
    authRepository = module.get<AuthRepositoryPort>(AuthRepositoryPort);
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  describe("execute", () => {
    it("should return user profile when user exists", async () => {
      jest
        .spyOn(authRepository, "getUserProfile")
        .mockResolvedValue(mockUserProfile);

      const result = await useCase.execute("123");

      expect(result).toEqual(mockUserProfile);
      expect(authRepository.getUserProfile).toHaveBeenCalledWith("123");
    });

    it("should throw NotFoundException when user does not exist", async () => {
      jest.spyOn(authRepository, "getUserProfile").mockResolvedValue(null);

      await expect(useCase.execute("123")).rejects.toThrow(
        new NotFoundException("User with ID 123 not found"),
      );
      expect(authRepository.getUserProfile).toHaveBeenCalledWith("123");
    });
  });
});
