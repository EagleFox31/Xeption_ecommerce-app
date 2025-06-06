import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "../../modules/auth/auth.controller";
import { GetUserProfileUseCase } from "../../application/auth/get-user-profile.use-case";
import { ValidateUserUseCase } from "../../application/auth/validate-user.use-case";
import { UserProfile } from "../../domain/auth/auth.entity";
import { AuthenticatedUser } from "../../common/auth/jwt.types";

describe("AuthController", () => {
  let controller: AuthController;
  let getUserProfileUseCase: GetUserProfileUseCase;
  let validateUserUseCase: ValidateUserUseCase;

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

  const mockAuthenticatedUser: AuthenticatedUser = {
    id: "123",
    email: "test@example.com",
    role: "customer",
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: GetUserProfileUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: ValidateUserUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    getUserProfileUseCase = module.get<GetUserProfileUseCase>(
      GetUserProfileUseCase,
    );
    validateUserUseCase = module.get<ValidateUserUseCase>(ValidateUserUseCase);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getCurrentUser", () => {
    it("should return user profile", async () => {
      jest
        .spyOn(getUserProfileUseCase, "execute")
        .mockResolvedValue(mockUserProfile);

      const result = await controller.getCurrentUser(mockAuthenticatedUser);

      expect(result).toEqual({
        success: true,
        data: mockUserProfile,
      });
      expect(getUserProfileUseCase.execute).toHaveBeenCalledWith("123");
    });
  });

  describe("validateToken", () => {
    it("should return validation result", async () => {
      jest.spyOn(validateUserUseCase, "execute").mockResolvedValue(true);

      const result = await controller.validateToken(mockAuthenticatedUser);

      expect(result).toEqual({
        success: true,
        data: {
          valid: true,
          user: {
            id: "123",
            email: "test@example.com",
            role: "customer",
          },
        },
      });
      expect(validateUserUseCase.execute).toHaveBeenCalledWith("123");
    });
  });
});
